export interface ContestEntryItem {
    id: string;
    userId: string;
    userDisplayName: string;
    userProfileImageUrl: string | null;
    photoUrl: string;
    description: string;
    /** 투표 전에는 null(비공개), 투표 완료 후에는 실제 득표 수 반환 */
    voteCount: number | null;
    rank: number | null;
    hasVoted: boolean;
    isMyEntry: boolean;
    createdAt: Date;
}

export interface ContestInfo {
    id: string;
    title: string;
    description: string;
    benefitText: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'ended';
    participantCount: number;
}

export interface GetCurrentContestResult {
    contest: ContestInfo;
    ranking: ContestEntryItem[];
    myVotedEntryId: string | null;
    hasEntry: boolean;
}

export interface GetContestEntriesResult {
    items: ContestEntryItem[];
    total: number;
    page: number;
    limit: number;
}

export interface GetPreviousRankingResult {
    contest: ContestInfo;
    ranking: ContestEntryItem[];
}

export interface GetHallOfFameResult {
    items: HallOfFameItem[];
    total: number;
    page: number;
    limit: number;
}

export interface HallOfFameItem {
    contestId: string;
    contestTitle: string;
    startDate: Date;
    endDate: Date;
    winner: ContestEntryItem;
}

export interface SubmitContestEntryResult {
    entryId: string;
}

export interface VoteContestEntryResult {
    entryId: string;
    newVoteCount: number;
}

export interface GetRandomEntryResult {
    /** 투표 후보 항목. 후보가 없거나 이미 투표한 경우 null */
    entry: ContestEntryItem | null;
    /** 이미 투표 완료 여부 */
    alreadyVoted: boolean;
}

export interface YesterdayTopEntry {
    rank: number;
    entry: ContestEntryItem;
    /** 득표율 (0~100, 소수점 1자리) */
    voteRate: number;
}

export interface GetYesterdayTopResult {
    contestId: string;
    ranking: YesterdayTopEntry[];
}
