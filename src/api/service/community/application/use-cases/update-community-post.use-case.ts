import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { CommunityPostWriteValidatorService } from '../../domain/services/community-post-write-validator.service';
import { COMMUNITY_POST_READER_PORT, type CommunityPostReaderPort } from '../ports/community-post-reader.port';
import type { CommunityPostDetailResult } from '../types/community-post-result.type';
import { COMMUNITY_POST_WRITER_PORT, type CommunityPostWriterPort } from '../ports/community-post-writer.port';
import type { CommunityPostUpdateCommand } from '../types/community-post-write.type';

@Injectable()
export class UpdateCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        @Inject(COMMUNITY_POST_WRITER_PORT)
        private readonly writer: CommunityPostWriterPort,
        private readonly validator: CommunityPostWriteValidatorService,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(
        userId: string,
        postId: string,
        patch: CommunityPostUpdateCommand,
    ): Promise<CommunityPostDetailResult> {
        this.validator.validateUpdate(patch);

        const existing = await this.reader.readPostById(postId);
        if (!existing) {
            throw new BadRequestException('해당 게시글을 찾을 수 없습니다.');
        }
        if (existing.authorId !== userId) {
            throw new ForbiddenException('본인 게시글만 수정할 수 있습니다.');
        }

        const sanitizedPatch: CommunityPostUpdateCommand = {
            ...patch,
            title: patch.title !== undefined ? patch.title.trim() || undefined : undefined,
            body: patch.body !== undefined ? patch.body.trim() : undefined,
            category: patch.category !== undefined ? patch.category.trim() || undefined : undefined,
        };

        // 최종 발행 상태에서 본문이 비어 있으면 거부 (임시저장→발행 전환 포함).
        const resultingStatus = sanitizedPatch.status ?? existing.status;
        const resultingBody = sanitizedPatch.body !== undefined ? sanitizedPatch.body : existing.body;
        if (resultingStatus === 'published' && resultingBody.trim().length === 0) {
            throw new BadRequestException('발행 게시글은 본문이 필요합니다.');
        }

        await this.writer.updateByAuthor(postId, userId, sanitizedPatch);

        const updated = await this.reader.readPostById(postId);
        if (!updated) {
            throw new BadRequestException('업데이트 후 게시글 조회에 실패했습니다.');
        }
        return this.mapper.toDetail(updated, []);
    }
}
