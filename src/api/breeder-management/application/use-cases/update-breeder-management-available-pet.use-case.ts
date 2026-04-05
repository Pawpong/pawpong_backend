import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AvailablePetAddDto } from '../../dto/request/available-pet-add-request.dto';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementAvailablePetCommandMapperService } from '../../domain/services/breeder-management-available-pet-command-mapper.service';

@Injectable()
export class UpdateBreederManagementAvailablePetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementAvailablePetCommandMapperService: BreederManagementAvailablePetCommandMapperService,
    ) {}

    async execute(
        userId: string,
        petId: string,
        updateData: Partial<AvailablePetAddDto>,
    ): Promise<{ message: string }> {
        const pet = await this.breederManagementPetCommandPort.findAvailablePetByIdAndBreeder(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 분양 개체를 찾을 수 없습니다.');
        }

        await this.breederManagementPetCommandPort.updateAvailablePet(
            petId,
            this.breederManagementAvailablePetCommandMapperService.toUpdateData(updateData),
        );

        return { message: '분양 개체 정보가 성공적으로 수정되었습니다.' };
    }
}
