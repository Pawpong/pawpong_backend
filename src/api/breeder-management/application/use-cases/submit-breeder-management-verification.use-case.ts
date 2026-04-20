import { Inject, Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../common/enum/user.enum';
import { DomainNotFoundError, DomainValidationError } from '../../../../common/error/domain.error';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../ports/breeder-management-settings.port';
import type { BreederManagementSettingsPort } from '../ports/breeder-management-settings.port';
import { BreederManagementVerificationCommandResultMapperService } from '../../domain/services/breeder-management-verification-command-result-mapper.service';
import { BreederManagementVerificationSubmissionMapperService } from '../../domain/services/breeder-management-verification-submission-mapper.service';
import type { BreederManagementVerificationSubmitCommand } from '../types/breeder-management-verification-command.type';

@Injectable()
export class SubmitBreederManagementVerificationUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_SETTINGS_PORT)
        private readonly breederManagementSettingsPort: BreederManagementSettingsPort,
        private readonly breederManagementVerificationSubmissionMapperService: BreederManagementVerificationSubmissionMapperService,
        private readonly breederManagementVerificationCommandResultMapperService: BreederManagementVerificationCommandResultMapperService,
    ) {}

    async execute(userId: string, verificationData: BreederManagementVerificationSubmitCommand): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.verification?.status === VerificationStatus.APPROVED) {
            throw new DomainValidationError('이미 인증이 완료된 브리더입니다.');
        }

        const verificationRecord =
            this.breederManagementVerificationSubmissionMapperService.toVerificationRecord(verificationData);
        await this.breederManagementSettingsPort.updateVerification(userId, verificationRecord);

        return this.breederManagementVerificationCommandResultMapperService.toVerificationSubmittedResult();
    }
}
