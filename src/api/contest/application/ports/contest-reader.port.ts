export const CONTEST_READER_PORT = Symbol('CONTEST_READER_PORT');

export interface ContestSnapshot {
    id: string;
    title: string;
    description: string;
    benefitText: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'ended';
    participantCount: number;
    createdAt: Date;
}

export interface ContestEntrySnapshot {
    id: string;
    contestId: string;
    userId: string;
    userDisplayName: string;
    userProfileImageFileName: string | null;
    photoFileName: string;
    description: string;
    voteCount: number;
    rank: number | null;
    createdAt: Date;
}

export interface ContestReaderPort {
    /** 현재 active 콘테스트 조회 */
    findActive(): Promise<ContestSnapshot | null>;

    /** 가장 최근 ended 콘테스트 조회 (저번주 랭킹용) */
    findLatestEnded(): Promise<ContestSnapshot | null>;

    /** 모든 ended 콘테스트 (명예의 전당 목록용, 최신순) */
    findAllEnded(query: { page: number; limit: number }): Promise<ContestSnapshot[]>;
    countAllEnded(): Promise<number>;

    /** 특정 콘테스트 상위 N 개 항목 (voteCount 내림차순) */
    findTopEntries(contestId: string, limit: number): Promise<ContestEntrySnapshot[]>;

    /** 항목 페이지네이션 (voteCount 내림차순) */
    findEntries(contestId: string, query: { page: number; limit: number }): Promise<ContestEntrySnapshot[]>;
    countEntries(contestId: string): Promise<number>;

    /** 유저의 콘테스트 항목 조회 */
    findEntryByUserId(contestId: string, userId: string): Promise<ContestEntrySnapshot | null>;

    /** 항목 단건 조회 */
    findEntryById(entryId: string): Promise<ContestEntrySnapshot | null>;

    /** 유저가 콘테스트에서 투표한 entryId 반환 (없으면 null) */
    findVotedEntryId(contestId: string, voterId: string): Promise<string | null>;
}
