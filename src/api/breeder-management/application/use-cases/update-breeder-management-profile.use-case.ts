import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileUpdateRequestDto } from '../../dto/request/profile-update-request.dto';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BreederManagementCommandResponseFactoryService } from '../../domain/services/breeder-management-command-response-factory.service';
import { BreederManagementProfileUpdateMapperService } from '../../domain/services/breeder-management-profile-update-mapper.service';

@Injectable()
export class UpdateBreederManagementProfileUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        private readonly breederManagementProfileUpdateMapperService: BreederManagementProfileUpdateMapperService,
        private readonly breederManagementCommandResponseFactoryService: BreederManagementCommandResponseFactoryService,
    ) {}

    async execute(userId: string, updateData: ProfileUpdateRequestDto): Promise<{ message: string }> {
        const breeder = await this.breederManagementProfilePort.findByIdWithAllData(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const mappedUpdateData = this.breederManagementProfileUpdateMapperService.toUpdateData(breeder, updateData);
        await this.breederManagementProfilePort.updateProfile(userId, mappedUpdateData);

        return this.breederManagementCommandResponseFactoryService.createProfileUpdated();
    }
}
