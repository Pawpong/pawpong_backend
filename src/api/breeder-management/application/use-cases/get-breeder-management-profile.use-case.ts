import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../common/error/domain.error';

import { BREEDER_MANAGEMENT_FILE_URL_PORT } from '../ports/breeder-management-file-url.port';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementFileUrlPort } from '../ports/breeder-management-file-url.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BreederManagementProfileAssemblerService } from '../../domain/services/breeder-management-profile-assembler.service';
import type { BreederManagementProfileResult } from '../types/breeder-management-result.type';

@Injectable()
export class GetBreederManagementProfileUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_FILE_URL_PORT)
        private readonly breederManagementFileUrlPort: BreederManagementFileUrlPort,
        private readonly breederManagementProfileAssemblerService: BreederManagementProfileAssemblerService,
    ) {}

    async execute(userId: string): Promise<BreederManagementProfileResult> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        const [parentPets, availablePets] = await Promise.all([
            this.breederManagementProfilePort.findActiveParentPetsByBreederId(userId),
            this.breederManagementProfilePort.findActiveAvailablePetsByBreederId(userId),
        ]);

        return this.breederManagementProfileAssemblerService.toResponse(
            breeder,
            parentPets,
            availablePets,
            this.breederManagementFileUrlPort,
        );
    }
}
