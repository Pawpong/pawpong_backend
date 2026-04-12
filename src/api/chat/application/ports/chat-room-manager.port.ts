import { ChatRoomStatus } from '../../../../schema/chat-room.schema';

export interface ChatRoomSnapshot {
    id: string;
    adopterId: string;
    breederId: string;
    applicationId?: string;
    status: ChatRoomStatus;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt: Date;
}

export const CHAT_ROOM_MANAGER = Symbol('CHAT_ROOM_MANAGER');

export interface ChatRoomManagerPort {
    findRoomById(roomId: string): Promise<ChatRoomSnapshot | null>;
    findRoomByParticipants(adopterId: string, breederId: string): Promise<ChatRoomSnapshot | null>;
    findRoomsByAdopterId(adopterId: string): Promise<ChatRoomSnapshot[]>;
    findRoomsByBreederId(breederId: string): Promise<ChatRoomSnapshot[]>;
    createRoom(adopterId: string, breederId: string, applicationId?: string): Promise<ChatRoomSnapshot>;
    updateRoomLastMessage(roomId: string, content: string): Promise<void>;
    closeRoom(roomId: string): Promise<void>;
}
