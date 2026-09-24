import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../schema/chat-message.schema';

export type ChatRoomCounterpartResult = {
    userId: string;
    role: SenderRole;
    nickname: string;
    profileImageUrl?: string;
};

export type ChatRoomResult = {
    roomId: string;
    applicationIds: string[];
    /** @deprecated applicationIds를 사용한다. */
    applicationId?: string;
    petIds: string[];
    /** 가장 최근에 연결된 분양 개체 ID */
    petId?: string;
    status: ChatRoomStatus;
    counterpart: ChatRoomCounterpartResult;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
};
