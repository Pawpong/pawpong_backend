export type CommunityHallOfFameWinnerResult = {
    rank: number;
    postId: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    /** 대표 사진 URL — 사진 없는 글이면 null */
    photoUrl: string | null;
    bodyExcerpt: string;
    author: {
        userId: string;
        authorModel: 'Adopter' | 'Breeder';
        nickname: string;
        profileImageUrl: string | null;
    };
};

export type CommunityHallOfFameResult = {
    periodKey: string;
    startDate: string;
    endDate: string;
    state: 'open' | 'final';
    refreshedAt: string;
    /** 0~3건. 해당 회차에 글이 없으면 빈 배열이고 폴백하지 않는다. */
    winners: CommunityHallOfFameWinnerResult[];
};
