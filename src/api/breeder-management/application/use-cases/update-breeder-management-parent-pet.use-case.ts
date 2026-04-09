import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ParentPetUpdateDto } from '../../dto/request/parent-pet-update-request.dto';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementParentPetCommandResponseService } from '../../domain/services/breeder-management-parent-pet-command-response.service';
import { BreederManagementParentPetCommandMapperService } from '../../domain/services/breeder-management-parent-pet-command-mapper.service';

@Injectable()
export class UpdateBreederManagementParentPetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementParentPetCommandMapperService: BreederManagementParentPetCommandMapperService,
        private readonly breederManagementParentPetCommandResponseService: BreederManagementParentPetCommandResponseService,
    ) {}

    async execute(userId: string, petId: string, updateData: ParentPetUpdateDto): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findParentPetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 부모견/부모묘를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.updateParentPet(
            petId,
            this.breederManagementParentPetCommandMapperService.toUpdateData(updateData),
        );

        return this.breederManagementParentPetCommandResponseService.createParentPetUpdated();
    }
}
