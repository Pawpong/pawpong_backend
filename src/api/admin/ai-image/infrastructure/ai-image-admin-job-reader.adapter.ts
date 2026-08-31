import { Injectable } from '@nestjs/common';

import { AiImageAdminJobResultMapperService } from '../domain/services/ai-image-admin-job-result-mapper.service';
import { AiImageAdminJobRepository } from '../repository/ai-image-admin-job.repository';
import type { AiImageAdminJobReaderPort } from '../application/ports/ai-image-admin-job-reader.port';
import type { AiImageAdminJobListCommand, AiImageAdminJobPage } from '../application/types/ai-image-admin-job.type';

/** 어드민 생성 작업 조회 어댑터 */
@Injectable()
export class AiImageAdminJobReaderAdapter implements AiImageAdminJobReaderPort {
    constructor(
        private readonly jobRepository: AiImageAdminJobRepository,
        private readonly jobResultMapper: AiImageAdminJobResultMapperService,
    ) {}

    async findPage(command: AiImageAdminJobListCommand): Promise<AiImageAdminJobPage> {
        const criteria = {
            status: command.status,
            userId: command.userId,
            filterId: command.filterId,
        };
        const skip = (command.page - 1) * command.limit;

        // 목록과 총 건수는 서로 의존하지 않으므로 동시에 조회한다
        const [documents, totalCount] = await Promise.all([
            this.jobRepository.findPaged(criteria, skip, command.limit),
            this.jobRepository.count(criteria),
        ]);

        return {
            items: documents.map((document) => this.jobResultMapper.toResult(document)),
            totalCount,
        };
    }
}
