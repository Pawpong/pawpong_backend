import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT } from '../ports/breeder-management-account-command.port';
import type { BreederManagementAccountCommandPort } from '../ports/breeder-management-account-command.port';
import { BreederManagementCommandResponseFactoryService } from '../../domain/services/breeder-management-command-response-factory.service';

@Injectable()
export class DeleteBreederManagementAccountUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT)
        private readonly breederManagementAccountCommandPort: BreederManagementAccountCommandPort,
        private readonly breederManagementCommandResponseFactoryService: BreederManagementCommandResponseFactoryService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(userId: string, deleteData?: { reason?: string; otherReason?: string }) {
        this.logger.logStart('deleteBreederAccount', '브리더 계정 탈퇴 처리 시작', { userId });

        const breeder = await this.breederManagementAccountCommandPort.findBreederById(userId);
        if (!breeder) {
            this.logger.logError('deleteBreederAccount', '브리더를 찾을 수 없음', new Error('Breeder not found'));
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        if (breeder.accountStatus === 'deleted') {
            throw new BadRequestException('이미 탈퇴된 계정입니다.');
        }

        if (deleteData?.reason === 'other' && !deleteData?.otherReason) {
            throw new BadRequestException('기타 사유를 입력해주세요.');
        }

        const pendingApplications = await this.breederManagementAccountCommandPort.countPendingApplications(userId);
        if (pendingApplications > 0) {
            this.logger.logWarning('deleteBreederAccount', `진행 중인 입양 신청 ${pendingApplications}건 존재`, {
                userId,
                pendingApplications,
            });
        }

        const deletedAt = new Date();
        const command = {
            userId,
            deletedAt,
            reason: deleteData?.reason,
            otherReason: deleteData?.otherReason,
        };

        await this.breederManagementAccountCommandPort.softDeleteBreeder(command);

        const deactivatedPetsCount =
            await this.breederManagementAccountCommandPort.deactivateAllAvailablePetsByBreeder(userId);
        this.logger.log(`[deleteBreederAccount] 분양 개체 ${deactivatedPetsCount}개 비활성화 완료`);

        await this.breederManagementAccountCommandPort.notifyBreederWithdrawal(command, breeder);

        this.logger.logSuccess('deleteBreederAccount', '브리더 계정 탈퇴 완료', {
            userId,
            deletedAt,
            reason: deleteData?.reason,
            pendingApplications,
        });

        return this.breederManagementCommandResponseFactoryService.createAccountDeleted(userId, deletedAt);
    }
}
