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
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatService } from './chat.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { SendMessageRequestDto } from './dto/request/send-message-request.dto';
import { SenderRole } from '../../schema/chat-message.schema';

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
        private readonly chatService: ChatService,
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
     */
    @SubscribeMessage('send_message')
    async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: SendMessageRequestDto) {
        const user = this.connectedClients.get(client.id);
        if (!user) {
            throw new WsException('인증이 필요합니다.');
        }

        try {
            const message = await this.chatService.sendMessage(user.userId, user.role, dto);

            // 채팅방의 모든 참여자에게 새 메시지 브로드캐스트
            this.server.to(dto.roomId).emit('new_message', {
                messageId: message._id.toString(),
                roomId: dto.roomId,
                senderId: user.userId,
                senderRole: user.role,
                content: dto.content,
                messageType: message.messageType,
                isRead: false,
                createdAt: message.createdAt ?? new Date(),
            });
        } catch (error) {
            client.emit('error', { message: error.message });
        }
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
            await this.chatService.getMessages(user.userId, payload.roomId);
            this.server.to(payload.roomId).emit('messages_read', {
                roomId: payload.roomId,
                readBy: user.userId,
            });
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }
}
