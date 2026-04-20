import { MessageType } from '../../../../schema/chat-message.schema';

export interface CreateRoomCommand {
    breederId: string;
    applicationId?: string;
}

export interface SendMessageCommand {
    roomId: string;
    content: string;
    messageType?: MessageType;
}

export interface GetMessagesQuery {
    roomId: string;
    limit?: number;
    before?: Date;
}
