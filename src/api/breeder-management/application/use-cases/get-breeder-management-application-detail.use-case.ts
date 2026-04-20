import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../common/error/domain.error';

import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from '../ports/breeder-management-application-workflow.port';
import type { BreederManagementApplicationWorkflowPort } from '../ports/breeder-management-application-workflow.port';
import { BreederManagementApplicationDetailAssemblerService } from '../../domain/services/breeder-management-application-detail-assembler.service';

@Injectable()
export class GetBreederManagementApplicationDetailUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT)
        private readonly breederManagementApplicationWorkflowPort: BreederManagementApplicationWorkflowPort,
        private readonly breederManagementApplicationDetailAssemblerService: BreederManagementApplicationDetailAssemblerService,
    ) {}

    async execute(userId: string, applicationId: string) {
        const application = await this.breederManagementApplicationWorkflowPort.findApplicationByIdAndBreeder(
            applicationId,
            userId,
        );

        if (!application) {
            throw new DomainNotFoundError('해당 입양 신청을 찾을 수 없거나 조회 권한이 없습니다.');
        }

        return this.breederManagementApplicationDetailAssemblerService.toResponse(application);
    }
}
