import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddBreederManagementParentPetUseCase } from './application/use-cases/add-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from './application/use-cases/remove-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from './application/use-cases/update-breeder-management-parent-pet.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './constants/breeder-management-response-messages';
import { ParentPetAddDto } from './dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from './dto/request/parent-pet-update-request.dto';
import { PetAddResponseDto } from './dto/response/pet-add-response.dto';
import { PetRemoveResponseDto } from './dto/response/pet-remove-response.dto';
import { PetUpdateResponseDto } from './dto/response/pet-update-response.dto';
import {
    ApiAddBreederManagementParentPetEndpoint,
    ApiRemoveBreederManagementParentPetEndpoint,
    ApiUpdateBreederManagementParentPetEndpoint,
} from './swagger';

@BreederManagementProtectedController()
export class BreederManagementParentPetsController {
    constructor(
        private readonly addBreederManagementParentPetUseCase: AddBreederManagementParentPetUseCase,
        private readonly updateBreederManagementParentPetUseCase: UpdateBreederManagementParentPetUseCase,
        private readonly removeBreederManagementParentPetUseCase: RemoveBreederManagementParentPetUseCase,
    ) {}

    @Post('parent-pets')
    @ApiAddBreederManagementParentPetEndpoint()
    async addParentPet(
        @CurrentUser('userId') userId: string,
        @Body() parentPetDto: ParentPetAddDto,
    ): Promise<ApiResponseDto<PetAddResponseDto>> {
        const result = await this.addBreederManagementParentPetUseCase.execute(userId, parentPetDto);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAdded);
    }

    @Patch('parent-pets/:petId')
    @ApiUpdateBreederManagementParentPetEndpoint()
    async updateParentPet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
        @Body() updateData: ParentPetUpdateDto,
    ): Promise<ApiResponseDto<PetUpdateResponseDto>> {
        const result = await this.updateBreederManagementParentPetUseCase.execute(userId, petId, updateData);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdated);
    }

    @Delete('parent-pets/:petId')
    @ApiRemoveBreederManagementParentPetEndpoint()
    async removeParentPet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetRemoveResponseDto>> {
        const result = await this.removeBreederManagementParentPetUseCase.execute(userId, petId);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemoved);
    }
}
