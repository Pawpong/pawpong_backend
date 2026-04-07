import { Body, Get, Param, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { ExploreBreedersUseCase } from './application/use-cases/explore-breeders.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetBreederReviewsUseCase } from './application/use-cases/get-breeder-reviews.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { BreederOptionalAuthController } from './decorator/breeder-public-controller.decorator';
import { SearchBreederRequestDto } from './dto/request/search-breeder-request.dto';
import { BreederCardResponseDto } from './dto/response/breeder-card-response.dto';
import { BreederExploreResponseDto } from './dto/response/breeder-explore-response.dto';
import { BreederProfileResponseDto } from './dto/response/breeder-profile-response.dto';
import { BreederReviewItemDto, BreederReviewsResponseDto } from './dto/response/breeder-reviews-response.dto';
import { ParentPetListResponseDto } from './dto/response/parent-pet-list.dto';
import { PetsListResponseDto } from './dto/response/pets-list-response.dto';
import {
    ApiExploreBreedersEndpoint,
    ApiGetBreederParentPetsEndpoint,
    ApiGetBreederPetsEndpoint,
    ApiGetBreederProfileEndpoint,
    ApiGetBreederReviewsEndpoint,
} from './swagger/decorators';

@BreederOptionalAuthController()
export class BreederOptionalAuthHttpController {
    constructor(
        private readonly exploreBreedersUseCase: ExploreBreedersUseCase,
        private readonly getBreederProfileUseCase: GetBreederProfileUseCase,
        private readonly getBreederReviewsUseCase: GetBreederReviewsUseCase,
        private readonly getBreederPetsUseCase: GetBreederPetsUseCase,
        private readonly getBreederParentPetsUseCase: GetBreederParentPetsUseCase,
    ) {}

    @Post('explore')
    @ApiExploreBreedersEndpoint()
    async exploreBreeders(
        @Body() searchDto: SearchBreederRequestDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederCardResponseDto>>> {
        const result = await this.exploreBreedersUseCase.execute(searchDto, userId);
        return ApiResponseDto.success(result, '브리더 목록이 조회되었습니다.');
    }

    @Get(':id')
    @ApiGetBreederProfileEndpoint()
    async getBreederProfile(
        @Param('id') breederId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<BreederProfileResponseDto>> {
        const result = await this.getBreederProfileUseCase.execute(breederId, userId);
        return ApiResponseDto.success(result, '브리더 프로필이 조회되었습니다.');
    }

    @Get(':id/reviews')
    @ApiGetBreederReviewsEndpoint()
    async getBreederReviews(
        @Param('id') breederId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederReviewItemDto>>> {
        const result = await this.getBreederReviewsUseCase.execute(breederId, Number(page), Number(limit));
        return ApiResponseDto.success(result, '후기 목록이 조회되었습니다.');
    }

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
