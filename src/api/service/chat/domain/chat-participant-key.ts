/** 두 사용자 순서와 무관한 1:1 DM 식별 키를 만든다. */
export function buildChatParticipantKey(participantIds: string[]): string {
    return [...participantIds].sort().join(':');
}
