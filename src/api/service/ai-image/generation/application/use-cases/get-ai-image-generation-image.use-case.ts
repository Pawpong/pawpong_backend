import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { Readable } from 'stream';

import { AiImageJobStatus } from '../../../../../../common/enum/ai-image-job-status.enum';
import {
    AI_IMAGE_FILE_STORAGE_PORT,
    type AiImageFileStoragePort,
} from '../../../shared/application/ports/ai-image-file-storage.port';
import {
    AI_IMAGE_JOB_READER_PORT,
    type AiImageJobReaderPort,
} from '../../../shared/application/ports/ai-image-job-reader.port';

/**
 * GET v2/ai-image/generation/:jobId/image — 내 결과 이미지 원본 바이트.
 *
 * 버킷에 CORS 가 없어 브라우저가 결과 URL 을 fetch 로 읽을 수 없다.
 * 커뮤니티 글쓰기는 결과를 일반 사진처럼 다시 올려야(community/ 키) 수정·명예의 전당 등
 * 기존 사진 흐름을 그대로 타므로, 바이트를 API 로 한 번 내려준다. 결과는 수십 KB 수준이다.
 */
@Injectable()
export class GetAiImageGenerationImageUseCase {
    constructor(
        @Inject(AI_IMAGE_JOB_READER_PORT)
        private readonly jobReader: AiImageJobReaderPort,
        @Inject(AI_IMAGE_FILE_STORAGE_PORT)
        private readonly fileStorage: AiImageFileStoragePort,
    ) {}

    async execute(jobId: string, userId: string): Promise<Readable> {
        const job = await this.jobReader.findById(jobId);
        if (!job) {
            throw new BadRequestException('AI 생성 요청을 찾을 수 없습니다.');
        }
        if (job.userId !== userId) {
            throw new ForbiddenException('본인의 생성 결과만 받을 수 있습니다.');
        }
        if (job.status !== AiImageJobStatus.SUCCEEDED || !job.outputObjectKey) {
            throw new BadRequestException('아직 완성되지 않은 생성 요청입니다.');
        }
        return this.fileStorage.openStream(job.outputObjectKey);
    }
}
