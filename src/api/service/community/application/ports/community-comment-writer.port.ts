export const COMMUNITY_COMMENT_WRITER_PORT = Symbol('COMMUNITY_COMMENT_WRITER_PORT');

export interface CommunityCommentCreateData {
    postId: string;
    authorId: string;
    authorModel: 'Adopter' | 'Breeder';
    authorNickname: string;
    authorProfileImageFileName?: string;
    body: string;
    parentCommentId?: string;
}

export interface CommunityCommentWriterPort {
    createComment(data: CommunityCommentCreateData): Promise<{ commentId: string }>;
    /** 본인 댓글만 수정. 미일치 또는 비활성이면 changed: false. */
    updateCommentByAuthor(commentId: string, authorId: string, body: string): Promise<{ changed: boolean }>;
    /** 본인 댓글 소프트 삭제. 미일치 또는 비활성이면 changed: false. */
    softDeleteCommentByAuthor(commentId: string, authorId: string): Promise<{ changed: boolean }>;
}
