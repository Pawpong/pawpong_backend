export const CONTEST_WRITER_PORT = Symbol('CONTEST_WRITER_PORT');

export interface CreateContestEntryData {
    contestId: string;
    userId: string;
    userDisplayName: string;
    userProfileImageFileName: string | null;
    photoFileName: string;
    description: string;
}

export interface ContestWriterPort {
    createEntry(data: CreateContestEntryData): Promise<string>;
    incrementParticipantCount(contestId: string): Promise<void>;
    vote(data: { contestId: string; entryId: string; voterId: string }): Promise<number>;
    /** 투표 취소. 취소할 투표가 없으면 null, 있으면 취소 후 항목의 총 투표 수 반환 */
    cancelVote(data: { contestId: string; entryId: string; voterId: string }): Promise<number | null>;
    updateEntryStatus(entryId: string, status: 'hidden' | 'deleted'): Promise<void>;
}
