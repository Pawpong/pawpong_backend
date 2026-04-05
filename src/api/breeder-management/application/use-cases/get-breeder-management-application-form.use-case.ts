import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BreederManagementApplicationFormAssemblerService } from '../../domain/services/breeder-management-application-form-assembler.service';
import { BreederManagementStandardQuestionCatalogService } from '../../domain/services/breeder-management-standard-question-catalog.service';

@Injectable()
export class GetBreederManagementApplicationFormUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        private readonly breederManagementApplicationFormAssemblerService: BreederManagementApplicationFormAssemblerService,
        private readonly breederManagementStandardQuestionCatalogService: BreederManagementStandardQuestionCatalogService,
    ) {}

    async execute(breederId: string) {
        const breeder = await this.breederManagementProfilePort.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        return this.breederManagementApplicationFormAssemblerService.toResponse(
            this.breederManagementStandardQuestionCatalogService.getAll(),
            breeder.applicationForm as any,
        );
    }
}
