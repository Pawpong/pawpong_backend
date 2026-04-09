import { Injectable } from '@nestjs/common';

import { ChatRepository } from '../repository/chat.repository';
import { ChatRoomManagerPort, ChatRoomSnapshot } from '../application/ports/chat-room-manager.port';
import { ChatMessageManagerPort, ChatMessageSnapshot } from '../application/ports/chat-message-manager.port';
import { MessageType, SenderRole } from '../../../schema/chat-message.schema';

@Injectable()
export class ChatMongooseManagerAdapter implements ChatRoomManagerPort, ChatMessageManagerPort {
    constructor(private readonly chatRepository: ChatRepository) {}

    // ─── ChatRoomManagerPort ─────────────────────────────────────────────────

    async findRoomById(roomId: string): Promise<ChatRoomSnapshot | null> {
        const room = await this.chatRepository.findRoomById(roomId);
        return room ? this.toRoomSnapshot(room) : null;
    }

    async findRoomByParticipants(adopterId: string, breederId: string): Promise<ChatRoomSnapshot | null> {
        const room = await this.chatRepository.findRoomByParticipants(adopterId, breederId);
        return room ? this.toRoomSnapshot(room) : null;
    }

    async findRoomsByAdopterId(adopterId: string): Promise<ChatRoomSnapshot[]> {
        const rooms = await this.chatRepository.findRoomsByAdopterId(adopterId);
        return rooms.map((r) => this.toRoomSnapshot(r));
    }

    async findRoomsByBreederId(breederId: string): Promise<ChatRoomSnapshot[]> {
        const rooms = await this.chatRepository.findRoomsByBreederId(breederId);
        return rooms.map((r) => this.toRoomSnapshot(r));
    }

    async createRoom(adopterId: string, breederId: string, applicationId?: string): Promise<ChatRoomSnapshot> {
        const room = await this.chatRepository.createRoom(adopterId, breederId, applicationId);
        return this.toRoomSnapshot(room);
    }

    async updateRoomLastMessage(roomId: string, content: string): Promise<void> {
        await this.chatRepository.updateRoomLastMessage(roomId, content);
    }

    async closeRoom(roomId: string): Promise<void> {
        await this.chatRepository.closeRoom(roomId);
    }

    // ─── ChatMessageManagerPort ──────────────────────────────────────────────

    async createMessage(data: {
        roomId: string;
        senderId: string;
        senderRole: SenderRole;
        receiverId: string;
        content: string;
        messageType: MessageType;
    }): Promise<ChatMessageSnapshot> {
        const message = await this.chatRepository.createMessage(data);
        return this.toMessageSnapshot(message);
    }

    async findMessagesByRoomId(roomId: string, limit: number, before?: Date): Promise<ChatMessageSnapshot[]> {
        const messages = await this.chatRepository.findMessagesByRoomId(roomId, limit, before);
        return messages.map((m) => this.toMessageSnapshot(m));
    }

    async markMessagesAsRead(roomId: string, receiverId: string): Promise<void> {
        await this.chatRepository.markMessagesAsRead(roomId, receiverId);
    }

    // ─── Mappers ─────────────────────────────────────────────────────────────

    private toRoomSnapshot(room: any): ChatRoomSnapshot {
        return {
            id: room._id.toString(),
            adopterId: room.adopterId,
            breederId: room.breederId,
            applicationId: room.applicationId,
            status: room.status,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            createdAt: room.createdAt,
        };
    }

    private toMessageSnapshot(message: any): ChatMessageSnapshot {
        return {
            id: message._id.toString(),
            roomId: message.roomId,
            senderId: message.senderId,
            senderRole: message.senderRole,
            receiverId: message.receiverId,
            content: message.content,
            messageType: message.messageType,
            isRead: message.isRead,
            readAt: message.readAt,
            createdAt: message.createdAt,
        };
    }
}
