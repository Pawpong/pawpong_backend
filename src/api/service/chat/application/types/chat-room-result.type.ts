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
    status: ChatRoomStatus;
    counterpart: ChatRoomCounterpartResult;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount: number;
    createdAt: string;
};
