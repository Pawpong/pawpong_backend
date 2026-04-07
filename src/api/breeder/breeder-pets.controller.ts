import { Get, Param, Query } from '@nestjs/common';

import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import { BreederOptionalAuthController, BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { PetDetailResponseDto } from './dto/response/pet-detail-response.dto';
import { ParentPetListResponseDto } from './dto/response/parent-pet-list.dto';
import { PetsListResponseDto } from './dto/response/pets-list-response.dto';
import {
    ApiGetBreederParentPetsEndpoint,
    ApiGetBreederPetDetailEndpoint,
    ApiGetBreederPetsEndpoint,
} from './swagger/decorators';

@BreederOptionalAuthController()
export class BreederPetsController {
    constructor(
        private readonly getBreederPetsUseCase: GetBreederPetsUseCase,
        private readonly getBreederParentPetsUseCase: GetBreederParentPetsUseCase,
    ) {}

    @Get(':id/pets')
    @ApiGetBreederPetsEndpoint()
    async getBreederPets(
        @Param('id') breederId: string,
        @Query('status') status?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<ApiResponseDto<PetsListResponseDto>> {
        const result = await this.getBreederPetsUseCase.execute(breederId, status, Number(page), Number(limit));
        return ApiResponseDto.success(result, '개체 목록이 조회되었습니다.');
    }

    @Get(':id/parent-pets')
    @ApiGetBreederParentPetsEndpoint()
    async getParentPets(
        @Param('id') breederId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<ApiResponseDto<ParentPetListResponseDto>> {
        const result = await this.getBreederParentPetsUseCase.execute(breederId, page, limit);
        return ApiResponseDto.success(result, '부모견/부모묘 목록이 조회되었습니다.');
    }
}

@BreederPublicController()
export class BreederPetDetailController {
    constructor(private readonly getBreederPetDetailUseCase: GetBreederPetDetailUseCase) {}

    @Get(':id/pet/:petId')
    @ApiGetBreederPetDetailEndpoint()
    async getPetDetail(
        @Param('id') breederId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetDetailResponseDto>> {
        const result = await this.getBreederPetDetailUseCase.execute(breederId, petId);
        return ApiResponseDto.success(result, '개체 상세 정보가 조회되었습니다.');
    }
}
