import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ChatRoom, ChatRoomDocument, ChatRoomStatus } from '../../schema/chat-room.schema';
import { ChatMessage, ChatMessageDocument, MessageType } from '../../schema/chat-message.schema';

@Injectable()
export class ChatRepository {
    constructor(
        @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoomDocument>,
        @InjectModel(ChatMessage.name) private readonly chatMessageModel: Model<ChatMessageDocument>,
    ) {}

    // ─── Room ────────────────────────────────────────────────────────────────

    async findRoomById(roomId: string): Promise<ChatRoomDocument | null> {
        return this.chatRoomModel.findById(roomId).lean().exec() as Promise<ChatRoomDocument | null>;
    }

    async findRoomByParticipants(adopterId: string, breederId: string): Promise<ChatRoomDocument | null> {
        return this.chatRoomModel.findOne({ adopterId, breederId }).lean().exec() as Promise<ChatRoomDocument | null>;
    }

    async findRoomsByAdopterId(adopterId: string): Promise<ChatRoomDocument[]> {
        return this.chatRoomModel
            .find({ adopterId, status: ChatRoomStatus.ACTIVE })
            .sort({ lastMessageAt: -1 })
            .lean()
            .exec() as unknown as Promise<ChatRoomDocument[]>;
    }

    async findRoomsByBreederId(breederId: string): Promise<ChatRoomDocument[]> {
        return this.chatRoomModel
            .find({ breederId, status: ChatRoomStatus.ACTIVE })
            .sort({ lastMessageAt: -1 })
            .lean()
            .exec() as unknown as Promise<ChatRoomDocument[]>;
    }

    async createRoom(adopterId: string, breederId: string, applicationId?: string): Promise<ChatRoomDocument> {
        const room = new this.chatRoomModel({ adopterId, breederId, applicationId });
        return room.save();
    }

    async updateRoomLastMessage(roomId: string, content: string): Promise<void> {
        await this.chatRoomModel.findByIdAndUpdate(roomId, {
            lastMessage: content,
            lastMessageAt: new Date(),
        });
    }

    async closeRoom(roomId: string): Promise<void> {
        await this.chatRoomModel.findByIdAndUpdate(roomId, { status: ChatRoomStatus.CLOSED });
    }

    // ─── Message ─────────────────────────────────────────────────────────────

    async createMessage(data: {
        roomId: string;
        senderId: string;
        senderRole: string;
        receiverId: string;
        content: string;
        messageType: MessageType;
    }): Promise<ChatMessageDocument> {
        const message = new this.chatMessageModel(data);
        return message.save();
    }

    async findMessagesByRoomId(
        roomId: string,
        limit: number = 50,
        before?: Date,
    ): Promise<ChatMessageDocument[]> {
        const query: Record<string, any> = { roomId };
        if (before) {
            query.createdAt = { $lt: before };
        }
        return this.chatMessageModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec() as unknown as Promise<ChatMessageDocument[]>;
    }

    async markMessagesAsRead(roomId: string, receiverId: string): Promise<void> {
        await this.chatMessageModel.updateMany(
            { roomId, receiverId, isRead: false },
            { isRead: true, readAt: new Date() },
        );
    }

    async countUnreadMessages(roomId: string, receiverId: string): Promise<number> {
        return this.chatMessageModel.countDocuments({ roomId, receiverId, isRead: false });
    }
}
