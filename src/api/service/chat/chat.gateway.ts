import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetMessagesUseCase } from './application/use-cases/get-messages.use-case';
import { ChatMessageMapperService } from './domain/services/chat-message-mapper.service';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { SendMessageRequestDto } from './dto/request/send-message-request.dto';
import { SenderRole } from '../../../schema/chat-message.schema';

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
 */
@WebSocketGateway({
    namespace: '/chat',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // socketId → { userId, role }
    private connectedClients = new Map<string, { userId: string; role: SenderRole }>();

    constructor(
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly getMessagesUseCase: GetMessagesUseCase,
        private readonly chatMessageMapperService: ChatMessageMapperService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    /**
     * 연결 시 JWT 토큰 검증
     */
    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                (client.handshake.query?.token as string) ||
                client.handshake.headers?.authorization?.replace('Bearer ', '');

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            const role = payload.role === 'adopter' ? SenderRole.ADOPTER : SenderRole.BREEDER;
            this.connectedClients.set(client.id, { userId: payload.sub, role });

            this.logger.logSuccess('ChatGateway', `클라이언트 연결: ${client.id} (${payload.sub})`);
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.connectedClients.delete(client.id);
        this.logger.logSuccess('ChatGateway', `클라이언트 연결 해제: ${client.id}`);
    }

    /**
     * 채팅방 입장
     * payload: { roomId: string }
     */
    @SubscribeMessage('join_room')
    async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string }) {
        const user = this.connectedClients.get(client.id);
        if (!user) {
            throw new WsException('인증이 필요합니다.');
        }

        client.join(payload.roomId);
        this.logger.logSuccess('ChatGateway', `${user.userId} 채팅방 입장: ${payload.roomId}`);
    }

    /**
     * 채팅방 퇴장
     * payload: { roomId: string }
     */
    @SubscribeMessage('leave_room')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string }) {
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
    async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageRequestDto) {
        const user = this.connectedClients.get(client.id);
        if (!user) {
            throw new WsException('인증이 필요합니다.');
        }

        try {
            const result = await this.sendMessageUseCase.execute(user.userId, user.role, {
                roomId: dto.roomId,
                content: dto.content,
                messageType: dto.messageType,
            });

            // 로컬 개발이나 Kafka 장애 중에도 단일 인스턴스 채팅은 끊기지 않게 한다.
            // Kafka 발행 성공 시에는 consumer가 동일 payload를 브로드캐스트한다.
            if (!result.brokerPublished) {
                this.broadcastNewMessage(this.chatMessageMapperService.toBroadcastPayload(result));
            }
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    /**
     * Kafka Consumer(ChatKafkaConsumer)가 호출하는 broadcast 메서드.
     * 채팅방에 연결된 모든 클라이언트에게 새 메시지를 전달한다.
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
        this.server.to(message.roomId).emit('new_message', message);
    }

    /**
     * 메시지 읽음 처리
     * payload: { roomId: string }
     */
    @SubscribeMessage('read_messages')
    async handleReadMessages(@ConnectedSocket() client: Socket, @MessageBody() payload: { roomId: string }) {
        const user = this.connectedClients.get(client.id);
        if (!user) {
            throw new WsException('인증이 필요합니다.');
        }

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
