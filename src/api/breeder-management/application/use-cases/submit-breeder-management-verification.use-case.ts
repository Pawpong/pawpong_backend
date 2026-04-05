import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../common/enum/user.enum';
import { VerificationSubmitRequestDto } from '../../dto/request/verification-submit-request.dto';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../ports/breeder-management-settings.port';
import type { BreederManagementSettingsPort } from '../ports/breeder-management-settings.port';
import { BreederManagementVerificationSubmissionMapperService } from '../../domain/services/breeder-management-verification-submission-mapper.service';

@Injectable()
export class SubmitBreederManagementVerificationUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_SETTINGS_PORT)
        private readonly breederManagementSettingsPort: BreederManagementSettingsPort,
        private readonly breederManagementVerificationSubmissionMapperService: BreederManagementVerificationSubmissionMapperService,
    ) {}

    async execute(userId: string, verificationData: VerificationSubmitRequestDto): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.verification?.status === VerificationStatus.APPROVED) {
            throw new BadRequestException('이미 인증이 완료된 브리더입니다.');
        }

        const verificationRecord =
            this.breederManagementVerificationSubmissionMapperService.toVerificationRecord(verificationData);
        await this.breederManagementSettingsPort.updateVerification(userId, verificationRecord);

        return { message: '브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다.' };
    }
}
