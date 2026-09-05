import { SenderRole } from '../../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../../common/enum/user.enum';

export type ChatParticipantProfileSnapshot = {
    userId: string;
    role: SenderRole;
    nickname: string;
    profileImageUrl?: string;
    accountStatus: UserStatus;
};

export const CHAT_PARTICIPANT_READER = Symbol('CHAT_PARTICIPANT_READER');

export interface ChatParticipantReaderPort {
    findParticipant(userId: string, role?: SenderRole): Promise<ChatParticipantProfileSnapshot | null>;
}
