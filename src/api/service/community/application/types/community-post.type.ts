/**
 * v2 커뮤니티 — application 계층 내부 타입.
 */

export type CommunityPetType = 'dog' | 'cat' | 'reptile';
export type CommunityPostSort = 'latest' | 'popular';
export type CommunityAuthorModel = 'Adopter' | 'Breeder';

/** 공개 범위 — 전체공개 / 팔로워공개 / 나만보기 */
export type CommunityPostVisibility = 'public' | 'followers' | 'private';
/** 발행 상태 — 정식 발행 / 임시저장 */
export type CommunityPostStatus = 'draft' | 'published';

export interface CommunityPostSnapshot {
    postId: string;
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageFileName?: string;
    title?: string;
    body: string;
    photos: string[];
    petType?: CommunityPetType;
    category?: string;
    visibility: CommunityPostVisibility;
    status: CommunityPostStatus;
    likeCount: number;
    commentCount: number;
    saveCount: number;
    viewCount: number;
    createdAt: Date;
}

export interface CommunityPostCommentSnapshot {
    commentId: string;
    postId: string;
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageFileName?: string;
    parentCommentId: string | null;
    body: string;
    likeCount: number;
    createdAt: Date;
}

export interface CommunityPostListQuery {
    petType?: CommunityPetType;
    category?: string;
    /**
     * 작성자 ID 필터 — 마이홈 게시글 탭 (Figma 278:170) 등.
     * 컨트롤러에서 'me' 별칭을 인증 사용자 id 로 치환한 뒤 전달한다.
     */
    authorId?: string;
    sort: CommunityPostSort;
    skip: number;
    limit: number;
    /**
     * 조회 상태 필터. 미지정 시 published(피드) 만 조회한다.
     * draft 를 지정하면 임시저장 조회로 간주하고 viewerId 본인 글로만 강제 제한한다.
     */
    status?: CommunityPostStatus;
    /** 현재 요청 사용자 ID. 팔로워공개/나만보기 열람 판정 기준. 없으면 public 만. */
    viewerId?: string;
    /** 뷰어가 팔로우한 작성자 ID 목록. 팔로워공개 글 열람 허용 판정에 사용. */
    viewerFolloweeIds?: string[];
}

export interface CommunityPostCommentListQuery {
    postId: string;
    skip: number;
    limit: number;
}
