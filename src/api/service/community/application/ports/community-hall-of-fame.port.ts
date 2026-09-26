export type CommunityHallOfFameWinnerSnapshot = {
    rank: number;
    postId: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    /** 대표 사진 파일명 — 서명 URL 은 만료되므로 파일명으로 보관한다 */
    photoFileName: string | null;
    bodyExcerpt: string;
    authorId: string;
    authorModel: 'Adopter' | 'Breeder';
    authorNickname: string;
    authorProfileImageFileName: string | null;
};

export type CommunityHallOfFameSnapshot = {
    periodKey: string;
    startDate: Date;
    endDate: Date;
    state: 'open' | 'final';
    refreshedAt: Date;
    winners: CommunityHallOfFameWinnerSnapshot[];
};

export type CommunityHallOfFameUpsertCommand = {
    periodKey: string;
    startDate: Date;
    endDate: Date;
    refreshedAt: Date;
    winners: CommunityHallOfFameWinnerSnapshot[];
};

export const COMMUNITY_HALL_OF_FAME_PORT = Symbol('COMMUNITY_HALL_OF_FAME_PORT');

export interface CommunityHallOfFamePort {
    /** state='open' 인 회차만 갱신한다. 확정된 회차는 건드리지 않는다. */
    upsertOpen(command: CommunityHallOfFameUpsertCommand): Promise<void>;

    /** open 이면 final 로 확정하고 true 를 반환한다. 이미 final 이거나 없으면 false. */
    finalize(periodKey: string): Promise<boolean>;

    findByPeriodKey(periodKey: string): Promise<CommunityHallOfFameSnapshot | null>;

    /** 확정된 회차만 최신순으로 */
    findFinalized(skip: number, limit: number): Promise<{ items: CommunityHallOfFameSnapshot[]; totalItems: number }>;
}
