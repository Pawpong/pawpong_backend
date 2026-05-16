import type { CommunityPostCreatePersistData, CommunityPostUpdateCommand } from '../types/community-post-write.type';

export const COMMUNITY_POST_WRITER_PORT = Symbol('COMMUNITY_POST_WRITER_PORT');

export interface CommunityPostWriterPort {
    create(data: CommunityPostCreatePersistData): Promise<{ postId: string }>;
    /**
     * 작성자 본인의 활성 게시글만 갱신한다. authorId 미일치 또는 isActive=false 면 null 반환.
     */
    updateByAuthor(postId: string, authorId: string, patch: CommunityPostUpdateCommand): Promise<{ changed: boolean }>;
    /**
     * 작성자 본인의 게시글을 isActive=false 로 소프트 삭제.
     * authorId 미일치 또는 이미 비활성이면 changed=false.
     */
    softDeleteByAuthor(postId: string, authorId: string): Promise<{ changed: boolean }>;
}
