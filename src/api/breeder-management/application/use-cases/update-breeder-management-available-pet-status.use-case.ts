import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PetStatus } from '../../../../common/enum/user.enum';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementCommandResponseFactoryService } from '../../domain/services/breeder-management-command-response-factory.service';

@Injectable()
export class UpdateBreederManagementAvailablePetStatusUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementCommandResponseFactoryService: BreederManagementCommandResponseFactoryService,
    ) {}

    async execute(userId: string, petId: string, status: PetStatus): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findAvailablePetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.updateAvailablePetStatus(petId, status);

        return this.breederManagementCommandResponseFactoryService.createAvailablePetStatusUpdated();
    }
}
