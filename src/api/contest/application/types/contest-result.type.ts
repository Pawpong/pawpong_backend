export interface ContestEntryItem {
    id: string;
    userId: string;
    userDisplayName: string;
    userProfileImageUrl: string | null;
    photoUrl: string;
    description: string;
    voteCount: number;
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
