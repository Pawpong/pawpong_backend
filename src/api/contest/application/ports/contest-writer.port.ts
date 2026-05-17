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
}
