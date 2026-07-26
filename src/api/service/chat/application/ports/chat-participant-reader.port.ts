import { SenderRole } from '../../../../../schema/chat-message.schema';

export type ChatParticipantProfileSnapshot = {
    userId: string;
    role: SenderRole;
    nickname: string;
    profileImageUrl?: string;
};

export const CHAT_PARTICIPANT_READER = Symbol('CHAT_PARTICIPANT_READER');

export interface ChatParticipantReaderPort {
    findProfile(userId: string, role: SenderRole): Promise<ChatParticipantProfileSnapshot | null>;
}
