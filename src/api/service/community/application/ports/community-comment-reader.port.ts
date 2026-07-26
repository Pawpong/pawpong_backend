export const COMMUNITY_COMMENT_READER_PORT = Symbol('COMMUNITY_COMMENT_READER_PORT');

export interface CommunityCommentSnapshot {
    commentId: string;
    postId: string;
    authorId: string;
    isActive: boolean;
}

export interface CommunityCommentReaderPort {
    /** 수정/삭제 전 권한 검증용 단건 조회. 비활성 포함. */
    readCommentById(commentId: string): Promise<CommunityCommentSnapshot | null>;
}
