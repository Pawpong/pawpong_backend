import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementAvailablePetCommandResponseService } from '../../domain/services/breeder-management-available-pet-command-response.service';
import { BreederManagementAvailablePetCommandMapperService } from '../../domain/services/breeder-management-available-pet-command-mapper.service';
import type { BreederManagementAvailablePetUpdateCommand } from '../types/breeder-management-pet-command.type';

@Injectable()
export class UpdateBreederManagementAvailablePetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementAvailablePetCommandMapperService: BreederManagementAvailablePetCommandMapperService,
        private readonly breederManagementAvailablePetCommandResponseService: BreederManagementAvailablePetCommandResponseService,
    ) {}

    async execute(
        userId: string,
        petId: string,
        updateData: BreederManagementAvailablePetUpdateCommand,
    ): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findAvailablePetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.updateAvailablePet(
            petId,
            this.breederManagementAvailablePetCommandMapperService.toUpdateData(updateData),
        );

        return this.breederManagementAvailablePetCommandResponseService.createAvailablePetUpdated();
    }
}
