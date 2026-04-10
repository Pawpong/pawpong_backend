import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BreederManagementProfileCommandResponseService } from '../../domain/services/breeder-management-profile-command-response.service';
import { BreederManagementProfileUpdateMapperService } from '../../domain/services/breeder-management-profile-update-mapper.service';
import type { BreederManagementProfileUpdateCommand } from '../types/breeder-management-profile-command.type';

@Injectable()
export class UpdateBreederManagementProfileUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        private readonly breederManagementProfileUpdateMapperService: BreederManagementProfileUpdateMapperService,
        private readonly breederManagementProfileCommandResponseService: BreederManagementProfileCommandResponseService,
    ) {}

    async execute(userId: string, updateData: BreederManagementProfileUpdateCommand): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findByIdWithAllData(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const mappedUpdateData = this.breederManagementProfileUpdateMapperService.toUpdateData(breeder, updateData);
        await this.breederManagementProfilePort.updateProfile(userId, mappedUpdateData);

        return this.breederManagementProfileCommandResponseService.createProfileUpdated();
    }
}
