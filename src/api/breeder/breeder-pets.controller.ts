import { Get, Param, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import type { BreederPetsPageResult } from './application/types/breeder-result.type';
import { BreederOptionalAuthController, BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { PetDetailResponseDto } from './dto/response/pet-detail-response.dto';
import { ParentPetListResponseDto } from './dto/response/parent-pet-list.dto';
import { BREEDER_RESPONSE_MESSAGES } from './domain/services/breeder-response-message.service';
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
    ): Promise<ApiResponseDto<BreederPetsPageResult>> {
        const result = await this.getBreederPetsUseCase.execute(breederId, status, Number(page), Number(limit));
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.petsRetrieved);
    }

    @Get(':id/parent-pets')
    @ApiGetBreederParentPetsEndpoint()
    async getParentPets(
        @Param('id') breederId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<ApiResponseDto<ParentPetListResponseDto>> {
        const result = await this.getBreederParentPetsUseCase.execute(breederId, page, limit);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.parentPetsRetrieved);
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
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.petDetailRetrieved);
    }
}
