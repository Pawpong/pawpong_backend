import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError } from '../../../../common/error/domain.error';

import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementParentPetCommandResultMapperService } from '../../domain/services/breeder-management-parent-pet-command-result-mapper.service';
import { BreederManagementParentPetCommandMapperService } from '../../domain/services/breeder-management-parent-pet-command-mapper.service';
import type { BreederManagementParentPetUpdateCommand } from '../types/breeder-management-pet-command.type';

@Injectable()
export class UpdateBreederManagementParentPetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementParentPetCommandMapperService: BreederManagementParentPetCommandMapperService,
        private readonly breederManagementParentPetCommandResultMapperService: BreederManagementParentPetCommandResultMapperService,
    ) {}

    async execute(
        userId: string,
        petId: string,
        updateData: BreederManagementParentPetUpdateCommand,
    ): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findParentPetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new DomainNotFoundError('해당 부모견/부모묘를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.updateParentPet(
            petId,
            this.breederManagementParentPetCommandMapperService.toUpdateData(updateData),
        );

        return this.breederManagementParentPetCommandResultMapperService.toParentPetUpdatedResult();
    }
}
