import { SenderRole } from '../../../../../schema/chat-message.schema';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';

export interface ChatRoomParticipantSnapshot {
    userId: string;
    role: SenderRole;
}

export interface ChatRoomParticipantStateSnapshot {
    userId: string;
    lastReadMessageId?: string;
    lastReadAt?: Date;
    hiddenAt?: Date;
}

export interface ChatRoomSnapshot {
    id: string;
    participantIds: string[];
    participants: ChatRoomParticipantSnapshot[];
    participantKey: string;
    applicationIds: string[];
    petIds: string[];
    participantStates: ChatRoomParticipantStateSnapshot[];
    status: ChatRoomStatus;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt: Date;

    /** @deprecated 마이그레이션 기간 응답/이벤트 호환용 */
    adopterId?: string;
    /** @deprecated 마이그레이션 기간 응답/이벤트 호환용 */
    breederId?: string;
    /** @deprecated applicationIds를 사용한다. */
    applicationId?: string;
    /** 가장 최근에 연결된 분양 개체 ID */
    petId?: string;
}

export const CHAT_ROOM_MANAGER = Symbol('CHAT_ROOM_MANAGER');

export interface ChatRoomManagerPort {
    findRoomById(roomId: string): Promise<ChatRoomSnapshot | null>;
    findRoomByParticipants(participantIds: string[]): Promise<ChatRoomSnapshot | null>;
    findRoomsByParticipantId(userId: string): Promise<ChatRoomSnapshot[]>;
    createRoom(
        participants: ChatRoomParticipantSnapshot[],
        applicationId?: string,
        petId?: string,
    ): Promise<ChatRoomSnapshot>;
    activateRoom(roomId: string, applicationId?: string, petId?: string): Promise<ChatRoomSnapshot>;
    updateRoomLastMessage(roomId: string, content: string): Promise<void>;
    updateReadMarker(roomId: string, userId: string, messageId?: string): Promise<void>;
    hideRoom(roomId: string, userId: string): Promise<void>;
}
