import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementParentPetCommandResponseService } from '../../domain/services/breeder-management-parent-pet-command-response.service';
import { BreederManagementParentPetCommandMapperService } from '../../domain/services/breeder-management-parent-pet-command-mapper.service';
import type { BreederManagementParentPetCreateCommand } from '../types/breeder-management-pet-command.type';

@Injectable()
export class AddBreederManagementParentPetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementParentPetCommandMapperService: BreederManagementParentPetCommandMapperService,
        private readonly breederManagementParentPetCommandResponseService: BreederManagementParentPetCommandResponseService,
    ) {}

    async execute(
        userId: string,
        parentPetDto: BreederManagementParentPetCreateCommand,
    ): Promise<{ petId: string; message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const savedParentPet = await this.breederManagementPetCommandPort.createParentPet(
            this.breederManagementParentPetCommandMapperService.toCreateData(userId, parentPetDto),
        );

        return this.breederManagementParentPetCommandResponseService.createParentPetAdded(String(savedParentPet._id));
    }
}
