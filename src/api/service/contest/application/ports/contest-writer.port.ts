export const CONTEST_WRITER_PORT = Symbol('CONTEST_WRITER_PORT');

export interface CreateContestEntryData {
    contestId: string;
    userId: string;
    userDisplayName: string;
    userProfileImageFileName: string | null;
    photoFileName: string;
    description: string;
}

/**
 * 투표 쓰기 결과.
 * 쓰기 시점에 콘테스트 열림 여부를 원자적으로 재판정하므로,
 * 검증-쓰기 사이에 콘테스트가 종료돼도 'closed' 로 안전하게 거부된다.
 */
export type ContestVoteWriteResult =
    | { status: 'ok'; newVoteCount: number }
    | { status: 'closed' }
    | { status: 'duplicate' };

/** 투표 취소 쓰기 결과 */
export type ContestVoteCancelWriteResult =
    | { status: 'ok'; newVoteCount: number }
    | { status: 'closed' }
    | { status: 'not_voted' };

export interface ContestWriterPort {
    createEntry(data: CreateContestEntryData): Promise<string>;
    incrementParticipantCount(contestId: string): Promise<void>;
    vote(data: { contestId: string; entryId: string; voterId: string }): Promise<ContestVoteWriteResult>;
    cancelVote(data: { contestId: string; entryId: string; voterId: string }): Promise<ContestVoteCancelWriteResult>;
    updateEntryStatus(entryId: string, status: 'hidden' | 'deleted'): Promise<void>;
    /**
     * endDate 가 지났는데 아직 active 인 콘테스트를 ended 로 확정한다 (지연 종료 자기 치유).
     * 확정은 반드시 콘테스트 문서에 대한 "쓰기"로 진입해야 투표/취소 게이트와 직렬화된다.
     * 조건 불충족(이미 ended, 아직 미마감)이면 아무것도 하지 않는다.
     */
    finalizeExpiredContest(contestId: string): Promise<void>;
}
