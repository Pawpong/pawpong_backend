import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementAvailablePetCommandResultMapperService } from '../../domain/services/breeder-management-available-pet-command-result-mapper.service';

@Injectable()
export class RemoveBreederManagementAvailablePetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementAvailablePetCommandResultMapperService: BreederManagementAvailablePetCommandResultMapperService,
    ) {}

    async execute(userId: string, petId: string): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findAvailablePetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.deleteAvailablePet(petId);

        return this.breederManagementAvailablePetCommandResultMapperService.toAvailablePetRemovedResult();
    }
}
