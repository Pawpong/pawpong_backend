import type { CommunityAuthorModel, CommunityPetType } from './community-post.type';

/**
 * application/domain 계층 내부 결과 타입.
 * 컨트롤러 경계 밖으로 나가지 않으며 @ApiProperty 데코레이터에 의존하지 않는다.
 */

export interface CommunityPostCommentResult {
    commentId: string;
    postId: string;
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageUrl?: string;
    parentCommentId: string | null;
    body: string;
    likeCount: number;
    createdAt: string;
}

export interface CommunityPostCardResult {
    postId: string;
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageUrl?: string;
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
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageUrl?: string;
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
