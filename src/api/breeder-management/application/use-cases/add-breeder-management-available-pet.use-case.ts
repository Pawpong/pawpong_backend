import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AvailablePetAddDto } from '../../dto/request/available-pet-add-request.dto';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from '../ports/breeder-management-pet-command.port';
import type { BreederManagementPetCommandPort } from '../ports/breeder-management-pet-command.port';
import { BreederManagementCommandResponseFactoryService } from '../../domain/services/breeder-management-command-response-factory.service';
import { BreederManagementAvailablePetCommandMapperService } from '../../domain/services/breeder-management-available-pet-command-mapper.service';

@Injectable()
export class AddBreederManagementAvailablePetUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_PET_COMMAND_PORT)
        private readonly breederManagementPetCommandPort: BreederManagementPetCommandPort,
        private readonly breederManagementAvailablePetCommandMapperService: BreederManagementAvailablePetCommandMapperService,
        private readonly breederManagementCommandResponseFactoryService: BreederManagementCommandResponseFactoryService,
    ) {}

    async execute(userId: string, availablePetDto: AvailablePetAddDto): Promise<{ petId: string; message: string }> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const savedPet = await this.breederManagementPetCommandPort.createAvailablePet(
            this.breederManagementAvailablePetCommandMapperService.toCreateData(userId, availablePetDto),
        );

        return this.breederManagementCommandResponseFactoryService.createAvailablePetAdded(String(savedPet._id));
    }
}
