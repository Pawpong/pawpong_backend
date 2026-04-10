import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from '../ports/breeder-management-file-url.port';
import type { BreederManagementFileUrlPort } from '../ports/breeder-management-file-url.port';
import { BreederManagementVerificationStatusAssemblerService } from '../../domain/services/breeder-management-verification-status-assembler.service';
import type { BreederManagementVerificationStatusResult } from '../types/breeder-management-result.type';

@Injectable()
export class GetBreederManagementVerificationStatusUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_FILE_URL_PORT)
        private readonly breederManagementFileUrlPort: BreederManagementFileUrlPort,
        private readonly breederManagementVerificationStatusAssemblerService: BreederManagementVerificationStatusAssemblerService,
    ) {}

    async execute(userId: string): Promise<BreederManagementVerificationStatusResult> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        return this.breederManagementVerificationStatusAssemblerService.toResponse(
            breeder,
            this.breederManagementFileUrlPort,
        );
    }
}
