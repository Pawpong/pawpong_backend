import { Injectable } from '@nestjs/common';

import {
    ChatRoomParticipantSnapshot,
    ChatRoomParticipantStateSnapshot,
    ChatRoomSnapshot,
} from '../../application/ports/chat-room-manager.port';
import { buildChatParticipantKey } from '../chat-participant-key';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../schema/chat-message.schema';

type ChatRoomSource = {
    _id: { toString(): string };
    participantIds?: string[];
    participants?: ChatRoomParticipantSnapshot[];
    participantKey?: string;
    participantStates?: ChatRoomParticipantStateSnapshot[];
    applicationIds?: string[];
    adopterId?: string;
    breederId?: string;
    applicationId?: string;
    lastReadMessageId?: { adopter?: string; breeder?: string };
    status: ChatRoomStatus;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt: Date;
};

@Injectable()
export class ChatRoomMapperService {
    toSnapshot(room: ChatRoomSource): ChatRoomSnapshot {
        const participants = this.resolveParticipants(room);
        const participantIds =
            room.participantIds?.length === 2 ? room.participantIds : participants.map(({ userId }) => userId);
        const applicationIds = [
            ...new Set([...(room.applicationIds ?? []), room.applicationId].filter(Boolean)),
        ] as string[];

        return {
            id: room._id.toString(),
            participantIds,
            participants,
            participantKey: room.participantKey ?? buildChatParticipantKey(participantIds),
            applicationIds,
            participantStates: this.resolveParticipantStates(room, participants),
            adopterId: room.adopterId,
            breederId: room.breederId,
            applicationId: room.applicationId ?? applicationIds.at(-1),
            status: room.status,
            lastMessage: room.lastMessage,
            lastMessageAt: room.lastMessageAt,
            createdAt: room.createdAt,
        };
    }

    toSnapshots(rooms: ChatRoomSource[]): ChatRoomSnapshot[] {
        return rooms.map((room) => this.toSnapshot(room));
    }

    private resolveParticipants(room: ChatRoomSource): ChatRoomParticipantSnapshot[] {
        if (room.participants?.length === 2) {
            return room.participants.map(({ userId, role }) => ({ userId, role }));
        }

        return [
            room.adopterId ? { userId: room.adopterId, role: SenderRole.ADOPTER } : undefined,
            room.breederId ? { userId: room.breederId, role: SenderRole.BREEDER } : undefined,
        ].filter((participant): participant is ChatRoomParticipantSnapshot => Boolean(participant));
    }

    private resolveParticipantStates(
        room: ChatRoomSource,
        participants: ChatRoomParticipantSnapshot[],
    ): ChatRoomParticipantStateSnapshot[] {
        if (room.participantStates?.length) {
            return room.participantStates.map((state) => ({ ...state }));
        }

        return participants.map(({ userId, role }) => ({
            userId,
            lastReadMessageId:
                role === SenderRole.ADOPTER ? room.lastReadMessageId?.adopter : room.lastReadMessageId?.breeder,
        }));
    }
}
