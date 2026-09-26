export type CommunityHallOfFameCandidate = {
    postId: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    photos: string[];
    body: string;
    authorId: string;
    authorModel: 'Adopter' | 'Breeder';
    authorNickname: string;
    authorProfileImageFileName: string | null;
};

export const COMMUNITY_HALL_OF_FAME_POST_READER_PORT = Symbol('COMMUNITY_HALL_OF_FAME_POST_READER_PORT');

export interface CommunityHallOfFamePostReaderPort {
    /**
     * 기간 내 공개 게시글을 좋아요 우선으로 상위 N건 조회한다.
     * 동점이면 댓글 → 저장 → 먼저 올라온 글 순으로 가른다.
     */
    findTopPosts(startDate: Date, endDate: Date, limit: number): Promise<CommunityHallOfFameCandidate[]>;
}
