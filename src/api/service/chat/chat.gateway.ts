import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
    WsException,
} from '@nestjs/websockets';
import { Namespace, Socket, type DefaultEventsMap } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { ChatMessageMapperService } from './domain/services/chat-message-mapper.service';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { SendMessageRequestDto } from './dto/request/send-message-request.dto';
import { SenderRole } from '../../../schema/chat-message.schema';
import { Inject } from '@nestjs/common';
import { CHAT_ROOM_MANAGER, type ChatRoomManagerPort } from './application/ports/chat-room-manager.port';
import {
    CHAT_PARTICIPANT_READER,
    type ChatParticipantReaderPort,
} from './application/ports/chat-participant-reader.port';
import { ChatPolicyService } from './domain/services/chat-policy.service';
import { UserStatus } from '../../../common/enum/user.enum';
import { KafkaConsumerStatus } from '../../../common/kafka/kafka-consumer-status';
import { buildChatCorsOrigin } from './chat-cors.config';

/** 인증 미들웨어가 socket.data 에 심어두는 사용자 식별 정보 */
export interface ChatSocketUser {
    userId: string;
    role: SenderRole;
}

/** 소켓별 세션 데이터. 핸들러는 여기 담긴 값만 신뢰한다. */
interface ChatSocketData {
    user?: ChatSocketUser;
}

// socket.data 를 any 로 두면 인증 정보 접근이 전부 타입 밖으로 새므로 제네릭으로 고정한다.
type ChatSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, ChatSocketData>;
type ChatNamespace = Namespace<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, ChatSocketData>;

/**
 * 채팅 WebSocket Gateway
 *
 * 이벤트:
 * - join_room: 채팅방 입장
 * - leave_room: 채팅방 퇴장
 * - send_message: 메시지 전송
 * - read_messages: 메시지 읽음 처리
 *
 * 클라이언트 → 서버 이벤트 후 서버 → 클라이언트 emit:
 * - new_message: 새 메시지 수신
 * - messages_read: 읽음 처리 완료
 * - error: 에러 발생
 *
 * [인증 시점]
 * 인증은 반드시 `afterInit` 에서 등록하는 Socket.IO 미들웨어에서 끝낸다.
 * `handleConnection` 은 Socket.IO 가 반환 Promise 를 기다려주지 않아,
 * 그 안에서 await 후 인증 상태를 저장하면 클라이언트가 connect 직후 보낸
 * join_room 이 인증 정보를 못 보고 거절되는 경쟁 조건이 생긴다.
 */
@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: buildChatCorsOrigin(),
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: ChatNamespace;

    /** 이미 전파한 messageId → 전파 시각. Kafka consumer 지연 폴백과 consumer 재합류가 겹쳐도 중복 emit 하지 않는다. */
    private readonly broadcastedMessageIds = new Map<string, number>();

    private static readonly BROADCAST_DEDUP_TTL_MS = 60_000;
    private static readonly BROADCAST_DEDUP_MAX_ENTRIES = 2_000;

    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly getMessagesUseCase: GetMessagesUseCase,
        @Inject(CHAT_ROOM_MANAGER)
        private readonly chatRoomManager: ChatRoomManagerPort,
        @Inject(CHAT_PARTICIPANT_READER)
        private readonly participantReader: ChatParticipantReaderPort,
        private readonly chatPolicyService: ChatPolicyService,
        private readonly chatMessageMapperService: ChatMessageMapperService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly kafkaConsumerStatus: KafkaConsumerStatus,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 인증 미들웨어 등록.
     *
     * Socket.IO 미들웨어는 클라이언트에 connect 를 통지하기 전에 완료되므로,
     * 여기서 인증을 끝내면 "connect 직후 즉시 emit" 하는 클라이언트도 항상 인증된 상태로 처리된다.
     */
    afterInit(server: ChatNamespace): void {
        server.use((client, next) => {
            void this.authenticate(client).then(
                () => next(),
                (error: unknown) => next(error instanceof Error ? error : new Error('소켓 인증에 실패했습니다.')),
            );
        });
    }

    /**
     * JWT 검증 + 실제 사용자 확인. 통과하면 client.data.user 에 사용자 정보를 심는다.
     * 실패하면 throw 하며, 호출자가 next(error) 로 연결 자체를 거절한다.
     */
    private async authenticate(client: ChatSocket): Promise<void> {
        const token =
            client.handshake.auth?.token ||
            (client.handshake.query?.token as string) ||
            client.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new Error('인증 토큰이 없습니다.');
        }

        let payload: { sub?: string; role?: string };
        try {
            payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
        } catch {
            throw new Error('유효하지 않은 인증 토큰입니다.');
        }

        if (!payload?.sub || (payload.role !== 'adopter' && payload.role !== 'breeder')) {
            throw new Error('채팅을 사용할 수 없는 계정입니다.');
        }

        const role = payload.role === 'adopter' ? SenderRole.ADOPTER : SenderRole.BREEDER;
        const participant = await this.participantReader.findParticipant(payload.sub, role);
        if (!participant || participant.accountStatus === UserStatus.DELETED) {
            throw new Error('채팅을 사용할 수 없는 계정입니다.');
        }

        client.data.user = { userId: payload.sub, role };
    }

    handleConnection(client: ChatSocket): void {
        // 미들웨어를 통과한 소켓만 여기까지 온다.
        const user = this.readUser(client);
        this.logger.logSuccess('ChatGateway', `클라이언트 연결: ${client.id} (${user?.userId ?? 'unknown'})`);
    }

    handleDisconnect(client: ChatSocket): void {
        this.logger.logSuccess('ChatGateway', `클라이언트 연결 해제: ${client.id}`);
    }

    private readUser(client: ChatSocket): ChatSocketUser | undefined {
        return client.data.user;
    }

    private requireUser(client: ChatSocket): ChatSocketUser {
        const user = this.readUser(client);
        if (!user) {
            throw new WsException('인증이 필요합니다.');
        }
        return user;
    }

    /**
     * 채팅방 입장
     * payload: { roomId: string }
     */
    @SubscribeMessage('join_room')
    async handleJoinRoom(@ConnectedSocket() client: ChatSocket, @MessageBody() payload: { roomId: string }) {
        const user = this.requireUser(client);

        try {
            const room = this.chatPolicyService.requireRoom(await this.chatRoomManager.findRoomById(payload.roomId));
            this.chatPolicyService.requireParticipant(room, user.userId);
            await client.join(payload.roomId);
            this.logger.logSuccess('ChatGateway', `${user.userId} 채팅방 입장: ${payload.roomId}`);
        } catch (error) {
            throw new WsException(error instanceof Error ? error.message : '채팅방 입장에 실패했습니다.');
        }
    }

    /**
     * 채팅방 퇴장
     * payload: { roomId: string }
     */
    @SubscribeMessage('leave_room')
    handleLeaveRoom(@ConnectedSocket() client: ChatSocket, @MessageBody() payload: { roomId: string }) {
        client.leave(payload.roomId);
    }

    /**
     * 메시지 전송
     * payload: SendMessageRequestDto
     *
     * DB 저장 + Kafka emit을 수행한다.
     * 정상 경로의 WebSocket broadcast는 ChatKafkaConsumer → broadcastNewMessage()가 담당하고,
     * Kafka 장애 시에는 이 gateway가 같은 payload를 현재 인스턴스에 직접 broadcast한다.
     * 이렇게 하면 서버가 여러 대일 때도 모든 인스턴스의 Consumer가 동일 메시지를 받아
     * 각자 연결된 클라이언트에게 전달할 수 있으며, 단일 인스턴스 개발 환경도 중단되지 않는다.
     */
    @SubscribeMessage('send_message')
    async handleSendMessage(@ConnectedSocket() client: ChatSocket, @MessageBody() dto: SendMessageRequestDto) {
        const user = this.requireUser(client);

        try {
            const result = await this.sendMessageUseCase.execute(user.userId, user.role, {
                roomId: dto.roomId,
                content: dto.content,
                messageType: dto.messageType,
            });

            // 로컬 개발이나 Kafka 장애 중에도 단일 인스턴스 채팅은 끊기지 않게 한다.
            // 발행에 성공했더라도 consumer 가 아직 합류하지 않았으면 아무도 소비하지 않으므로
            // (부팅 직후 재시도 구간) consumer 준비 상태까지 함께 보고 폴백한다.
            // consumer 합류 후 같은 메시지가 다시 오면 broadcastNewMessage 의 중복 제거가 막아준다.
            if (!result.brokerPublished || !this.kafkaConsumerStatus.isReady()) {
                this.broadcastNewMessage(this.chatMessageMapperService.toBroadcastPayload(result));
            }
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    /**
     * Kafka Consumer(ChatKafkaConsumer)가 호출하는 broadcast 메서드.
     * 채팅방에 연결된 모든 클라이언트에게 새 메시지를 전달한다.
     *
     * 같은 messageId 는 한 번만 내보낸다. Kafka consumer 미준비 구간에서 gateway 가 직접
     * 전파한 메시지를 consumer 가 뒤늦게 합류해 offset 부터 다시 읽어도 중복 수신이 없다.
     */
    broadcastNewMessage(message: {
        messageId: string;
        roomId: string;
        senderId: string;
        senderRole: string;
        receiverId: string;
        content: string;
        messageType: string;
        isRead: boolean;
        createdAt: Date;
    }): void {
        if (!this.markBroadcasted(message.messageId)) {
            return;
        }

        this.server.to(message.roomId).emit('new_message', message);
    }

    /** 처음 보는 messageId 면 기록하고 true, 이미 전파한 메시지면 false 를 돌려준다. */
    private markBroadcasted(messageId: string | undefined): boolean {
        // 식별자가 없으면 중복 판정을 할 수 없으므로 그대로 전파한다.
        if (!messageId) return true;

        const now = Date.now();

        // Map 은 삽입 순서를 보존하고 기록 시각은 단조 증가하므로, 앞에서부터 만료분만 지우면 된다.
        for (const [id, broadcastedAt] of this.broadcastedMessageIds) {
            if (now - broadcastedAt <= ChatGateway.BROADCAST_DEDUP_TTL_MS) break;
            this.broadcastedMessageIds.delete(id);
        }

        if (this.broadcastedMessageIds.has(messageId)) return false;

        this.broadcastedMessageIds.set(messageId, now);

        // TTL 안이라도 무한정 쌓이지 않도록 상한을 넘으면 오래된 기록부터 버린다.
        for (const oldest of this.broadcastedMessageIds.keys()) {
            if (this.broadcastedMessageIds.size <= ChatGateway.BROADCAST_DEDUP_MAX_ENTRIES) break;
            this.broadcastedMessageIds.delete(oldest);
        }

        return true;
    }

    /**
     * 메시지 읽음 처리
     * payload: { roomId: string }
     */
    @SubscribeMessage('read_messages')
    async handleReadMessages(@ConnectedSocket() client: ChatSocket, @MessageBody() payload: { roomId: string }) {
        const user = this.requireUser(client);

        try {
            await this.getMessagesUseCase.execute(user.userId, { roomId: payload.roomId });
            this.server.to(payload.roomId).emit('messages_read', {
                roomId: payload.roomId,
                readBy: user.userId,
            });
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }
}
