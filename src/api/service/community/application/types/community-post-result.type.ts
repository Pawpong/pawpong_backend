import type {
    CommunityAuthorModel,
    CommunityPetType,
    CommunityPostStatus,
    CommunityPostVisibility,
} from './community-post.type';

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
    visibility: CommunityPostVisibility;
    status: CommunityPostStatus;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    createdAt: string;
    /**
     * 카드에 한 줄로 노출할 최신 댓글. 없으면 빈 배열.
     * 상세(commentPreview)와 같은 형태를 쓰되 카드에서는 최신 1건만 담는다.
     */
    commentPreview: CommunityPostCommentResult[];
    /** 현재 요청 사용자의 좋아요 여부. 비인증 요청 시 false. */
    isLiked: boolean;
    /** 현재 요청 사용자의 저장 여부. 비인증 요청 시 false. */
    isSaved: boolean;
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
    visibility: CommunityPostVisibility;
    status: CommunityPostStatus;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    viewCount: number;
    createdAt: string;
    commentPreview: CommunityPostCommentResult[];
    /** 현재 요청 사용자의 좋아요 여부. 비인증 요청 시 false. */
    isLiked: boolean;
    /** 현재 요청 사용자의 저장 여부. 비인증 요청 시 false. */
    isSaved: boolean;
}
