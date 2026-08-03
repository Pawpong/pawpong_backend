import { Inject, Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import type { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { AI_IMAGE_ADMIN_JOB_READER_PORT } from '../ports/ai-image-admin-job-reader.port';
import type { AiImageAdminJobReaderPort } from '../ports/ai-image-admin-job-reader.port';
import type { AiImageAdminJobListCommand, AiImageAdminJobResult } from '../types/ai-image-admin-job.type';

/**
 * GET /ai-image-admin/jobs
 *
 * 생성 작업을 최신순으로 조회한다. 결과 컨슈머는 처리 실패 시 예외를 던지지 않고
 * 로그만 남기므로(오프셋 커밋이 막히는 것을 피하기 위해), 운영자가 실패 작업을
 * 눈으로 확인할 수 있는 경로가 반드시 필요하다.
 */
@Injectable()
export class GetAiImageJobsUseCase {
    constructor(
        @Inject(AI_IMAGE_ADMIN_JOB_READER_PORT)
        private readonly jobReaderPort: AiImageAdminJobReaderPort,
    ) {}

    async execute(command: AiImageAdminJobListCommand): Promise<PaginationResponseDto<AiImageAdminJobResult>> {
        const page = await this.jobReaderPort.findPage(command);

        return new PaginationBuilder<AiImageAdminJobResult>()
            .setItems(page.items)
            .setPage(command.page)
            .setLimit(command.limit)
            .setTotalCount(page.totalCount)
            .build();
    }
}
