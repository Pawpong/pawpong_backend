import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddBreederManagementAvailablePetUseCase } from './application/use-cases/add-breeder-management-available-pet.use-case';
import { RemoveBreederManagementAvailablePetUseCase } from './application/use-cases/remove-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetStatusUseCase } from './application/use-cases/update-breeder-management-available-pet-status.use-case';
import { UpdateBreederManagementAvailablePetUseCase } from './application/use-cases/update-breeder-management-available-pet.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './constants/breeder-management-response-messages';
import { AvailablePetAddDto } from './dto/request/available-pet-add-request.dto';
import { PetStatusUpdateRequestDto } from './dto/request/pet-status-update-request.dto';
import { PetAddResponseDto } from './dto/response/pet-add-response.dto';
import { PetRemoveResponseDto } from './dto/response/pet-remove-response.dto';
import { PetStatusUpdateResponseDto } from './dto/response/pet-status-update-response.dto';
import { PetUpdateResponseDto } from './dto/response/pet-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementAvailablePetsController {
    constructor(
        private readonly addBreederManagementAvailablePetUseCase: AddBreederManagementAvailablePetUseCase,
        private readonly updateBreederManagementAvailablePetUseCase: UpdateBreederManagementAvailablePetUseCase,
        private readonly updateBreederManagementAvailablePetStatusUseCase: UpdateBreederManagementAvailablePetStatusUseCase,
        private readonly removeBreederManagementAvailablePetUseCase: RemoveBreederManagementAvailablePetUseCase,
    ) {}

    @Post('available-pets')
    @ApiEndpoint(BreederManagementSwaggerDocs.addAvailablePet)
    async addAvailablePet(
        @CurrentUser('userId') userId: string,
        @Body() availablePetDto: AvailablePetAddDto,
    ): Promise<ApiResponseDto<PetAddResponseDto>> {
        const result = await this.addBreederManagementAvailablePetUseCase.execute(userId, availablePetDto);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAdded);
    }

    @Patch('available-pets/:petId')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateAvailablePet)
    async updateAvailablePet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
        @Body() updateData: Partial<AvailablePetAddDto>,
    ): Promise<ApiResponseDto<PetUpdateResponseDto>> {
        const result = await this.updateBreederManagementAvailablePetUseCase.execute(userId, petId, updateData);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdated);
    }

    @Patch('available-pets/:petId/status')
    @ApiEndpoint(BreederManagementSwaggerDocs.updatePetStatus)
    async updatePetStatus(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
        @Body() statusData: PetStatusUpdateRequestDto,
    ): Promise<ApiResponseDto<PetStatusUpdateResponseDto>> {
        const result = await this.updateBreederManagementAvailablePetStatusUseCase.execute(
            userId,
            petId,
            statusData.petStatus,
        );

        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdated);
    }

    @Delete('available-pets/:petId')
    @ApiEndpoint(BreederManagementSwaggerDocs.removeAvailablePet)
    async removeAvailablePet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetRemoveResponseDto>> {
        const result = await this.removeBreederManagementAvailablePetUseCase.execute(userId, petId);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemoved);
    }
}
