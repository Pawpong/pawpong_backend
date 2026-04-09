import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementAvailablePetCommandResponseService } from '../../domain/services/breeder-management-available-pet-command-response.service';

@Injectable()
export class RemoveBreederManagementAvailablePetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementAvailablePetCommandResponseService: BreederManagementAvailablePetCommandResponseService,
    ) {}

    async execute(userId: string, petId: string): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findAvailablePetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.deleteAvailablePet(petId);

        return this.breederManagementAvailablePetCommandResponseService.createAvailablePetRemoved();
    }
}
