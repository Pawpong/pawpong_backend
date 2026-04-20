import { Injectable } from '@nestjs/common';

import { ChatRepository } from '../repository/chat.repository';
import { ChatRoomManagerPort, ChatRoomSnapshot } from '../application/ports/chat-room-manager.port';
import { ChatMessageManagerPort, ChatMessageSnapshot } from '../application/ports/chat-message-manager.port';
import { ChatRoomMapperService } from '../domain/services/chat-room-mapper.service';
import { ChatMessageMapperService } from '../domain/services/chat-message-mapper.service';
import { MessageType, SenderRole } from '../../../schema/chat-message.schema';

@Injectable()
export class ChatMongooseManagerAdapter implements ChatRoomManagerPort, ChatMessageManagerPort {
    constructor(
        private readonly chatRepository: ChatRepository,
        private readonly chatRoomMapperService: ChatRoomMapperService,
        private readonly chatMessageMapperService: ChatMessageMapperService,
    ) {}

    // ─── ChatRoomManagerPort ─────────────────────────────────────────────────

    async findRoomById(roomId: string): Promise<ChatRoomSnapshot | null> {
        const room = await this.chatRepository.findRoomById(roomId);
        return room ? this.chatRoomMapperService.toSnapshot(room as any) : null;
    }

    async findRoomByParticipants(adopterId: string, breederId: string): Promise<ChatRoomSnapshot | null> {
        const room = await this.chatRepository.findRoomByParticipants(adopterId, breederId);
        return room ? this.chatRoomMapperService.toSnapshot(room as any) : null;
    }

    async findRoomsByAdopterId(adopterId: string): Promise<ChatRoomSnapshot[]> {
        const rooms = await this.chatRepository.findRoomsByAdopterId(adopterId);
        return this.chatRoomMapperService.toSnapshots(rooms as any);
    }

    async findRoomsByBreederId(breederId: string): Promise<ChatRoomSnapshot[]> {
        const rooms = await this.chatRepository.findRoomsByBreederId(breederId);
        return this.chatRoomMapperService.toSnapshots(rooms as any);
    }

    async createRoom(adopterId: string, breederId: string, applicationId?: string): Promise<ChatRoomSnapshot> {
        const room = await this.chatRepository.createRoom(adopterId, breederId, applicationId);
        return this.chatRoomMapperService.toSnapshot(room as any);
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
        return this.chatMessageMapperService.toSnapshot(message as any);
    }

    async findMessagesByRoomId(roomId: string, limit: number, before?: Date): Promise<ChatMessageSnapshot[]> {
        const messages = await this.chatRepository.findMessagesByRoomId(roomId, limit, before);
        return this.chatMessageMapperService.toSnapshots(messages as any);
    }

    async markMessagesAsRead(roomId: string, receiverId: string): Promise<void> {
        await this.chatRepository.markMessagesAsRead(roomId, receiverId);
    }
}
