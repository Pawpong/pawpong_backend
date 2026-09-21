export const CHAT_APPLICATION_READER = Symbol('CHAT_APPLICATION_READER');

export interface ChatApplicationReaderPort {
    /** 신청 당사자 두 명이 채팅 참여자와 정확히 일치하는지 확인한다. */
    belongsToParticipants(applicationId: string, participantIds: string[]): Promise<boolean>;
}

export interface ChatApplicationResult {
    applicationId: string;
    direction: 'sent' | 'received';
    petName?: string;
    petId?: string;
    status: string;
    appliedAt?: string;
    standardResponses: Record<string, unknown>;
    customResponses: Array<{
        questionId: string;
        questionLabel: string;
        questionType: string;
        answer: string | string[];
    }>;
}

export const CHAT_APPLICATION_LIST_READER = Symbol('CHAT_APPLICATION_LIST_READER');
export interface ChatApplicationListReaderPort {
    readLinked(applicationIds: string[], participantIds: string[], userId: string): Promise<ChatApplicationResult[]>;
}
