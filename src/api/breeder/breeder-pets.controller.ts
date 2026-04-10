import { Get, Param, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../common/pipe/mongo-object-id.pipe';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import type { BreederPetsPageResult } from './application/types/breeder-result.type';
import { BreederOptionalAuthController, BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { BreederParentPetsQueryRequestDto, BreederPetsQueryRequestDto } from './dto/request/breeder-pets-query-request.dto';
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
        @Param('id', new MongoObjectIdPipe('브리더', '올바르지 않은 브리더 ID 형식입니다.')) breederId: string,
        @Query() query: BreederPetsQueryRequestDto,
    ): Promise<ApiResponseDto<BreederPetsPageResult>> {
        const result = await this.getBreederPetsUseCase.execute(breederId, query.status, query.page, query.limit);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.petsRetrieved);
    }

    @Get(':id/parent-pets')
    @ApiGetBreederParentPetsEndpoint()
    async getParentPets(
        @Param('id', new MongoObjectIdPipe('브리더', '올바르지 않은 브리더 ID 형식입니다.')) breederId: string,
        @Query() query: BreederParentPetsQueryRequestDto,
    ): Promise<ApiResponseDto<ParentPetListResponseDto>> {
        const result = await this.getBreederParentPetsUseCase.execute(breederId, query.page, query.limit);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.parentPetsRetrieved);
    }
}

@BreederPublicController()
export class BreederPetDetailController {
    constructor(private readonly getBreederPetDetailUseCase: GetBreederPetDetailUseCase) {}

    @Get(':id/pet/:petId')
    @ApiGetBreederPetDetailEndpoint()
    async getPetDetail(
        @Param('id', new MongoObjectIdPipe('브리더', '올바르지 않은 브리더 ID 형식입니다.')) breederId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetDetailResponseDto>> {
        const result = await this.getBreederPetDetailUseCase.execute(breederId, petId);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.petDetailRetrieved);
    }
}
