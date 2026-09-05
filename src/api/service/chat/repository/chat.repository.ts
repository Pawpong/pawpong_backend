import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ChatRoom, ChatRoomDocument, ChatRoomStatus } from '../../../../schema/chat-room.schema';
import { ChatMessage, ChatMessageDocument, MessageType, SenderRole } from '../../../../schema/chat-message.schema';
import { buildChatParticipantKey } from '../domain/chat-participant-key';
import type { ChatRoomParticipantSnapshot } from '../application/ports/chat-room-manager.port';

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

    async findRoomByParticipants(participantIds: string[]): Promise<ChatRoomDocument | null> {
        const [firstId, secondId] = participantIds;
        const participantKey = buildChatParticipantKey(participantIds);

        return (
            this.chatRoomModel
                .findOne({
                    $or: [
                        { participantKey },
                        { participantIds: { $all: participantIds, $size: 2 } },
                        { adopterId: firstId, breederId: secondId },
                        { adopterId: secondId, breederId: firstId },
                    ],
                })
                // 마이그레이션 전 중복 legacy 방이 있으면 ACTIVE 방을 우선해
                // 기존 partial unique index와 충돌 없이 같은 방을 재사용한다.
                .sort({ status: 1, createdAt: -1 })
                .lean()
                .exec() as Promise<ChatRoomDocument | null>
        );
    }

    async findRoomsByParticipantId(userId: string): Promise<ChatRoomDocument[]> {
        return this.chatRoomModel
            .find({
                status: ChatRoomStatus.ACTIVE,
                $and: [
                    { $or: [{ participantIds: userId }, { adopterId: userId }, { breederId: userId }] },
                    {
                        $nor: [
                            {
                                participantStates: {
                                    $elemMatch: { userId, hiddenAt: { $exists: true } },
                                },
                            },
                        ],
                    },
                ],
            })
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .lean()
            .exec() as unknown as Promise<ChatRoomDocument[]>;
    }

    async createRoom(participants: ChatRoomParticipantSnapshot[], applicationId?: string): Promise<ChatRoomDocument> {
        const participantIds = participants.map(({ userId }) => userId);
        const legacyAdopter = participants.find(({ role }) => role === SenderRole.ADOPTER);
        const legacyBreeder = participants.find(({ role }) => role === SenderRole.BREEDER);
        const hasLegacyAdopterBreederPair = Boolean(legacyAdopter && legacyBreeder);
        const room = new this.chatRoomModel({
            participantIds,
            participants,
            participantKey: buildChatParticipantKey(participantIds),
            participantStates: participantIds.map((userId) => ({ userId })),
            applicationIds: applicationId ? [applicationId] : [],
            applicationId,
            // 구버전 compound unique index가 아직 남은 롤아웃 구간에서도
            // same-role DM들이 null/null로 충돌하지 않도록 두 ID를 채운다.
            adopterId: hasLegacyAdopterBreederPair ? legacyAdopter!.userId : participantIds[0],
            breederId: hasLegacyAdopterBreederPair ? legacyBreeder!.userId : participantIds[1],
            status: ChatRoomStatus.ACTIVE,
        });
        return room.save();
    }

    async activateRoom(roomId: string, applicationId?: string): Promise<ChatRoomDocument | null> {
        const update: Record<string, unknown> = {
            $set: { status: ChatRoomStatus.ACTIVE },
        };
        if (applicationId) {
            update.$addToSet = { applicationIds: applicationId };
            (update.$set as Record<string, unknown>).applicationId = applicationId;
        }

        await this.chatRoomModel.updateOne({ _id: roomId }, update);
        // legacy 문서는 배열이 없을 수 있다. 배열이 있는 방에만 $[]를 적용한다.
        await this.chatRoomModel.updateOne(
            { _id: roomId, 'participantStates.0': { $exists: true } },
            { $unset: { 'participantStates.$[].hiddenAt': '' } },
        );
        return this.findRoomById(roomId);
    }

    async updateRoomLastMessage(roomId: string, content: string): Promise<void> {
        await this.chatRoomModel.updateOne(
            { _id: roomId },
            {
                $set: {
                    status: ChatRoomStatus.ACTIVE,
                    lastMessage: content,
                    lastMessageAt: new Date(),
                },
            },
        );
        await this.chatRoomModel.updateOne(
            { _id: roomId, 'participantStates.0': { $exists: true } },
            { $unset: { 'participantStates.$[].hiddenAt': '' } },
        );
    }

    async updateReadMarker(roomId: string, userId: string, messageId?: string): Promise<void> {
        const state = {
            lastReadAt: new Date(),
            ...(messageId ? { lastReadMessageId: messageId } : {}),
        };
        const update = Object.fromEntries(
            Object.entries(state).map(([key, value]) => [`participantStates.$.${key}`, value]),
        );
        const result = await this.chatRoomModel.updateOne(
            { _id: roomId, 'participantStates.userId': userId },
            { $set: update },
        );

        if (result.matchedCount === 0) {
            await this.chatRoomModel.updateOne(
                {
                    _id: roomId,
                    $or: [{ participantIds: userId }, { adopterId: userId }, { breederId: userId }],
                },
                { $push: { participantStates: { userId, ...state } } },
            );
        }
    }

    async hideRoom(roomId: string, userId: string): Promise<void> {
        const hiddenAt = new Date();
        const result = await this.chatRoomModel.updateOne(
            { _id: roomId, 'participantStates.userId': userId },
            { $set: { 'participantStates.$.hiddenAt': hiddenAt } },
        );

        if (result.matchedCount === 0) {
            await this.chatRoomModel.updateOne(
                {
                    _id: roomId,
                    $or: [{ participantIds: userId }, { adopterId: userId }, { breederId: userId }],
                },
                { $push: { participantStates: { userId, hiddenAt } } },
            );
        }
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

    async findMessagesByRoomId(roomId: string, limit: number = 50, before?: Date): Promise<ChatMessageDocument[]> {
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
