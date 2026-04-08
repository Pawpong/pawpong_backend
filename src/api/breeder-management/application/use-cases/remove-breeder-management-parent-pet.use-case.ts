import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementCommandResponseFactoryService } from '../../domain/services/breeder-management-command-response-factory.service';

@Injectable()
export class RemoveBreederManagementParentPetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementCommandResponseFactoryService: BreederManagementCommandResponseFactoryService,
    ) {}

    async execute(userId: string, petId: string): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findParentPetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 부모견/부모묘를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.deleteParentPet(petId);

        return this.breederManagementCommandResponseFactoryService.createParentPetRemoved();
    }
}
