import type { CommunityAuthorModel, CommunityPetType } from './community-post.type';

/**
 * application/domain 계층 내부 결과 타입.
 * 컨트롤러 경계 밖으로 나가지 않으며 @ApiProperty 데코레이터에 의존하지 않는다.
 */

export interface CommunityAuthorResult {
    userId: string;
    nickname: string;
    profileImageUrl?: string;
}

export interface CommunityPostCommentResult {
    commentId: string;
    postId: string;
    author: CommunityAuthorResult;
    /** 다형성 분기용 — 프론트 마이홈 연결 시 authorModel 기반 라우팅 */
    authorModel: CommunityAuthorModel;
    parentCommentId: string | null;
    body: string;
    likeCount: number;
    createdAt: string;
}

export interface CommunityPostCardResult {
    postId: string;
    author: CommunityAuthorResult;
    authorModel: CommunityAuthorModel;
    title?: string;
    bodyExcerpt: string;
    primaryPhotoUrl?: string;
    photoUrls: string[];
    petType?: CommunityPetType;
    category?: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    createdAt: string;
}

export interface CommunityPostDetailResult {
    postId: string;
    author: CommunityAuthorResult;
    authorModel: CommunityAuthorModel;
    title?: string;
    body: string;
    photoUrls: string[];
    petType?: CommunityPetType;
    category?: string;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    viewCount: number;
    createdAt: string;
    commentPreview: CommunityPostCommentResult[];
}
