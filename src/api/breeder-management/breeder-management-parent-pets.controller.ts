import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddBreederManagementParentPetUseCase } from './application/use-cases/add-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from './application/use-cases/remove-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from './application/use-cases/update-breeder-management-parent-pet.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { ParentPetAddDto } from './dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from './dto/request/parent-pet-update-request.dto';
import { PetAddResponseDto } from './dto/response/pet-add-response.dto';
import { PetRemoveResponseDto } from './dto/response/pet-remove-response.dto';
import { PetUpdateResponseDto } from './dto/response/pet-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementParentPetsController {
    constructor(
        private readonly addBreederManagementParentPetUseCase: AddBreederManagementParentPetUseCase,
        private readonly updateBreederManagementParentPetUseCase: UpdateBreederManagementParentPetUseCase,
        private readonly removeBreederManagementParentPetUseCase: RemoveBreederManagementParentPetUseCase,
    ) {}

    @Post('parent-pets')
    @ApiEndpoint(BreederManagementSwaggerDocs.addParentPet)
    async addParentPet(
        @CurrentUser('userId') userId: string,
        @Body() parentPetDto: ParentPetAddDto,
    ): Promise<ApiResponseDto<PetAddResponseDto>> {
        const result = await this.addBreederManagementParentPetUseCase.execute(userId, parentPetDto);
        return ApiResponseDto.success(result, '부모 반려동물이 성공적으로 등록되었습니다.');
    }

    @Patch('parent-pets/:petId')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateParentPet)
    async updateParentPet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
        @Body() updateData: ParentPetUpdateDto,
    ): Promise<ApiResponseDto<PetUpdateResponseDto>> {
        const result = await this.updateBreederManagementParentPetUseCase.execute(userId, petId, updateData);
        return ApiResponseDto.success(result, '부모 반려동물 정보가 성공적으로 수정되었습니다.');
    }

    @Delete('parent-pets/:petId')
    @ApiEndpoint(BreederManagementSwaggerDocs.removeParentPet)
    async removeParentPet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetRemoveResponseDto>> {
        const result = await this.removeBreederManagementParentPetUseCase.execute(userId, petId);
        return ApiResponseDto.success(result, '부모 반려동물이 성공적으로 삭제되었습니다.');
    }
}
