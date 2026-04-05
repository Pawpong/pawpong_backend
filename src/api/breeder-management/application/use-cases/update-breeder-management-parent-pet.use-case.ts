import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ParentPetUpdateDto } from '../../dto/request/parent-pet-update-request.dto';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementParentPetCommandMapperService } from '../../domain/services/breeder-management-parent-pet-command-mapper.service';

@Injectable()
export class UpdateBreederManagementParentPetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementParentPetCommandMapperService: BreederManagementParentPetCommandMapperService,
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

        return { message: '부모견/부모묘 정보가 성공적으로 수정되었습니다.' };
    }
}
