export const CHAT_APPLICATION_READER = Symbol('CHAT_APPLICATION_READER');

export interface ChatApplicationReaderPort {
    /** 신청 당사자 두 명이 채팅 참여자와 정확히 일치하는지 확인한다. */
    belongsToParticipants(applicationId: string, participantIds: string[]): Promise<boolean>;
}
