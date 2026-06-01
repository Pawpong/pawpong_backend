import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_COMMENT_READER_PORT, type CommunityCommentReaderPort } from '../ports/community-comment-reader.port';
import { COMMUNITY_COMMENT_WRITER_PORT, type CommunityCommentWriterPort } from '../ports/community-comment-writer.port';

@Injectable()
export class UpdateCommunityPostCommentUseCase {
    constructor(
        @Inject(COMMUNITY_COMMENT_READER_PORT)
        private readonly commentReader: CommunityCommentReaderPort,
        @Inject(COMMUNITY_COMMENT_WRITER_PORT)
        private readonly commentWriter: CommunityCommentWriterPort,
    ) {}

    async execute(
        commentId: string,
        userId: string,
        body: string,
    ): Promise<{ commentId: string; updated: boolean }> {
        const comment = await this.commentReader.readCommentById(commentId);
        if (!comment) throw new BadRequestException('해당 댓글을 찾을 수 없습니다.');
        if (comment.authorId !== userId) throw new ForbiddenException('본인 댓글만 수정할 수 있습니다.');

        const { changed } = await this.commentWriter.updateCommentByAuthor(commentId, userId, body);
        return { commentId, updated: changed };
    }
}
