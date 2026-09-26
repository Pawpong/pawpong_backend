import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AI_IMAGE_JOB_WRITER_PORT, type AiImageJobWriterPort } from '../ports/ai-image-job-writer.port';

/**
 * DELETE v2/ai-image/generation/:jobId — 내 AI 사진 보관함에서 지운다.
 * 기록은 남기고 목록에서만 뺀다(하루 생성 횟수 집계 유지). 커뮤니티에 올린 사진은 별도 파일이라 영향 없다.
 */
@Injectable()
export class HideAiImageGenerationUseCase {
    constructor(
        @Inject(AI_IMAGE_JOB_WRITER_PORT)
        private readonly jobWriter: AiImageJobWriterPort,
    ) {}

    async execute(jobId: string, userId: string): Promise<{ jobId: string; hidden: boolean }> {
        const hidden = await this.jobWriter.hideForUser(jobId, userId);
        if (!hidden) {
            throw new BadRequestException('보관함에서 찾을 수 없는 사진입니다.');
        }
        return { jobId, hidden };
    }
}
