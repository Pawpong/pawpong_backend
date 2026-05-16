import type { CommunityAuthorModel, CommunityPetType } from './community-post.type';

/**
 * v2 커뮤니티 게시글 작성/수정/삭제 — 내부 command/persist 타입.
 *
 * 작성 시 작성자 닉네임/프로필이미지는 denormalized snapshot 으로 함께 저장한다.
 * (read 쪽에서 author lookup 비용을 줄이고 닉네임 변경 시점 이전의 게시글 표시를 보존.)
 */

export interface CommunityAuthorSnapshot {
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageFileName?: string;
}

export interface CommunityPostCreateCommand {
    authorId: string;
    authorModel: CommunityAuthorModel;
    title?: string;
    body: string;
    photos: string[];
    petType?: CommunityPetType;
    category?: string;
}

export interface CommunityPostUpdateCommand {
    title?: string;
    body?: string;
    photos?: string[];
    petType?: CommunityPetType;
    category?: string;
}

export interface CommunityPostCreatePersistData {
    authorId: string;
    authorModel: CommunityAuthorModel;
    authorNickname: string;
    authorProfileImageFileName?: string;
    title?: string;
    body: string;
    photos: string[];
    petType?: CommunityPetType;
    category?: string;
}
