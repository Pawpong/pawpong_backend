import { ChatRoomSnapshot } from './chat-room-manager.port';
import { ChatMessageSnapshot } from './chat-message-manager.port';
import { SenderRole } from '../../../../schema/chat-message.schema';
import type { CreateRoomCommand, SendMessageCommand } from '../types/chat-command.type';

export const CREATE_OR_GET_ROOM_USE_CASE = Symbol('CREATE_OR_GET_ROOM_USE_CASE');
export const GET_MY_ROOMS_USE_CASE = Symbol('GET_MY_ROOMS_USE_CASE');
export const SEND_MESSAGE_USE_CASE = Symbol('SEND_MESSAGE_USE_CASE');
export const GET_MESSAGES_USE_CASE = Symbol('GET_MESSAGES_USE_CASE');
export const CLOSE_ROOM_USE_CASE = Symbol('CLOSE_ROOM_USE_CASE');

export interface CreateOrGetRoomUseCasePort {
    execute(adopterId: string, command: CreateRoomCommand): Promise<ChatRoomSnapshot>;
}

export interface GetMyRoomsUseCasePort {
    execute(userId: string, role: SenderRole): Promise<ChatRoomSnapshot[]>;
}

export interface SendMessageUseCasePort {
    execute(senderId: string, senderRole: SenderRole, command: SendMessageCommand): Promise<ChatMessageSnapshot>;
}

export interface GetMessagesUseCasePort {
    execute(userId: string, roomId: string, limit?: number, before?: Date): Promise<ChatMessageSnapshot[]>;
}

export interface CloseRoomUseCasePort {
    execute(userId: string, roomId: string): Promise<void>;
}
