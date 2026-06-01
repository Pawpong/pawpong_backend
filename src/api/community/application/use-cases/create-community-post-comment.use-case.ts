import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_AUTHOR_READER_PORT, type CommunityAuthorReaderPort } from '../ports/community-author-reader.port';
import { COMMUNITY_COMMENT_WRITER_PORT, type CommunityCommentWriterPort } from '../ports/community-comment-writer.port';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';

@Injectable()
export class CreateCommunityPostCommentUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_AUTHOR_READER_PORT)
        private readonly authorReader: CommunityAuthorReaderPort,
        @Inject(COMMUNITY_COMMENT_WRITER_PORT)
        private readonly commentWriter: CommunityCommentWriterPort,
    ) {}

    async execute(
        postId: string,
        userId: string,
        role: 'adopter' | 'breeder',
        command: { body: string; parentCommentId?: string },
    ): Promise<{ commentId: string }> {
        const trimmedBody = command.body.trim();
        if (!trimmedBody) throw new BadRequestException('댓글 내용을 입력해주세요.');

        const exists = await this.reader.existsActivePost(postId);
        if (!exists) throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');

        const author = await this.authorReader.readAuthorSnapshot(userId, role);
        if (!author) throw new BadRequestException('작성자 정보를 찾을 수 없습니다.');

        return this.commentWriter.createComment({
            postId,
            authorId: author.authorId,
            authorModel: author.authorModel,
            authorNickname: author.authorNickname,
            authorProfileImageFileName: author.authorProfileImageFileName,
            body: trimmedBody,
            parentCommentId: command.parentCommentId,
        });
    }
}
