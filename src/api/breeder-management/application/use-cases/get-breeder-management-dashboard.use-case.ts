import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../common/error/domain.error';

import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BreederManagementDashboardAssemblerService } from '../../domain/services/breeder-management-dashboard-assembler.service';
import type { BreederManagementDashboardResult } from '../types/breeder-management-result.type';

@Injectable()
export class GetBreederManagementDashboardUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        private readonly breederManagementDashboardAssemblerService: BreederManagementDashboardAssemblerService,
    ) {}

    async execute(userId: string): Promise<BreederManagementDashboardResult> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        const [pendingApplications, recentApplications, availablePetsCount] = await Promise.all([
            this.breederManagementProfilePort.countPendingApplications(userId),
            this.breederManagementProfilePort.findRecentApplications(userId, 5),
            this.breederManagementProfilePort.countActiveAvailablePets(userId),
        ]);

        return this.breederManagementDashboardAssemblerService.toResponse(
            breeder,
            pendingApplications,
            recentApplications,
            availablePetsCount,
        );
    }
}
