import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint, ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AddBreederManagementAvailablePetUseCase } from './application/use-cases/add-breeder-management-available-pet.use-case';
import { AddBreederManagementParentPetUseCase } from './application/use-cases/add-breeder-management-parent-pet.use-case';
import { GetBreederManagementMyPetsUseCase } from './application/use-cases/get-breeder-management-my-pets.use-case';
import { RemoveBreederManagementAvailablePetUseCase } from './application/use-cases/remove-breeder-management-available-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from './application/use-cases/remove-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementAvailablePetStatusUseCase } from './application/use-cases/update-breeder-management-available-pet-status.use-case';
import { UpdateBreederManagementAvailablePetUseCase } from './application/use-cases/update-breeder-management-available-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from './application/use-cases/update-breeder-management-parent-pet.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { AvailablePetAddDto } from './dto/request/available-pet-add-request.dto';
import { ParentPetAddDto } from './dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from './dto/request/parent-pet-update-request.dto';
import { PetStatusUpdateRequestDto } from './dto/request/pet-status-update-request.dto';
import { MyPetsListResponseDto } from './dto/response/my-pets-list-response.dto';
import { PetAddResponseDto } from './dto/response/pet-add-response.dto';
import { PetRemoveResponseDto } from './dto/response/pet-remove-response.dto';
import { PetStatusUpdateResponseDto } from './dto/response/pet-status-update-response.dto';
import { PetUpdateResponseDto } from './dto/response/pet-update-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementPetsController {
    constructor(
        private readonly addBreederManagementParentPetUseCase: AddBreederManagementParentPetUseCase,
        private readonly updateBreederManagementParentPetUseCase: UpdateBreederManagementParentPetUseCase,
        private readonly removeBreederManagementParentPetUseCase: RemoveBreederManagementParentPetUseCase,
        private readonly addBreederManagementAvailablePetUseCase: AddBreederManagementAvailablePetUseCase,
        private readonly updateBreederManagementAvailablePetUseCase: UpdateBreederManagementAvailablePetUseCase,
        private readonly updateBreederManagementAvailablePetStatusUseCase: UpdateBreederManagementAvailablePetStatusUseCase,
        private readonly removeBreederManagementAvailablePetUseCase: RemoveBreederManagementAvailablePetUseCase,
        private readonly getBreederManagementMyPetsUseCase: GetBreederManagementMyPetsUseCase,
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

    @Post('available-pets')
    @ApiEndpoint(BreederManagementSwaggerDocs.addAvailablePet)
    async addAvailablePet(
        @CurrentUser('userId') userId: string,
        @Body() availablePetDto: AvailablePetAddDto,
    ): Promise<ApiResponseDto<PetAddResponseDto>> {
        const result = await this.addBreederManagementAvailablePetUseCase.execute(userId, availablePetDto);
        return ApiResponseDto.success(result, '분양 반려동물이 성공적으로 등록되었습니다.');
    }

    @Patch('available-pets/:petId')
    @ApiEndpoint(BreederManagementSwaggerDocs.updateAvailablePet)
    async updateAvailablePet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
        @Body() updateData: Partial<AvailablePetAddDto>,
    ): Promise<ApiResponseDto<PetUpdateResponseDto>> {
        const result = await this.updateBreederManagementAvailablePetUseCase.execute(userId, petId, updateData);
        return ApiResponseDto.success(result, '분양 반려동물 정보가 성공적으로 수정되었습니다.');
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

        return ApiResponseDto.success(result, '반려동물 상태가 성공적으로 변경되었습니다.');
    }

    @Delete('available-pets/:petId')
    @ApiEndpoint(BreederManagementSwaggerDocs.removeAvailablePet)
    async removeAvailablePet(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetRemoveResponseDto>> {
        const result = await this.removeBreederManagementAvailablePetUseCase.execute(userId, petId);
        return ApiResponseDto.success(result, '분양 반려동물이 성공적으로 삭제되었습니다.');
    }

    @Get('my-pets')
    @ApiPaginatedEndpoint(BreederManagementSwaggerDocs.myPets)
    async getMyPets(
        @CurrentUser('userId') userId: string,
        @Query('status') status?: string,
        @Query('includeInactive') includeInactive?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<ApiResponseDto<MyPetsListResponseDto>> {
        const result = await this.getBreederManagementMyPetsUseCase.execute(
            userId,
            status,
            includeInactive === 'true',
            Number(page),
            Number(limit),
        );
        return ApiResponseDto.success(result, '개체 목록이 조회되었습니다.');
    }
}
