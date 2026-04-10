import { Get, Post, Body, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { ExploreBreedersUseCase } from './application/use-cases/explore-breeders.use-case';
import { GetPopularBreedersUseCase } from './application/use-cases/get-popular-breeders.use-case';
import { SearchBreedersUseCase } from './application/use-cases/search-breeders.use-case';
import { BreederOptionalAuthController, BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { SearchBreederRequestDto } from './dto/request/search-breeder-request.dto';
import { BreederCardResponseDto } from './dto/response/breeder-card-response.dto';
import { BreederExploreResponseDto } from './dto/response/breeder-explore-response.dto';
import { BreederSearchResponseDto } from './dto/response/breeder-search-response.dto';
import { BREEDER_RESPONSE_MESSAGES } from './domain/services/breeder-response-message.service';
import { ApiExploreBreedersEndpoint, ApiGetPopularBreedersEndpoint, ApiSearchBreedersEndpoint } from './swagger/decorators';

@BreederPublicController()
export class BreederDiscoveryController {
    constructor(
        private readonly searchBreedersUseCase: SearchBreedersUseCase,
        private readonly getPopularBreedersUseCase: GetPopularBreedersUseCase,
    ) {}

    @Get('search')
    @ApiSearchBreedersEndpoint()
    async searchBreeders(
        @Query() searchDto: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<BreederSearchResponseDto>> {
        const result = await this.searchBreedersUseCase.execute(searchDto);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            BREEDER_RESPONSE_MESSAGES.searchCompleted,
        );
    }

    @Get('popular')
    @ApiGetPopularBreedersEndpoint()
    async getPopularBreeders(): Promise<ApiResponseDto<BreederCardResponseDto[]>> {
        const result = await this.getPopularBreedersUseCase.execute(10);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.popularListRetrieved);
    }
}

@BreederOptionalAuthController()
export class BreederExploreController {
    constructor(private readonly exploreBreedersUseCase: ExploreBreedersUseCase) {}

    @Post('explore')
    @ApiExploreBreedersEndpoint()
    async exploreBreeders(
        @Body() searchDto: SearchBreederRequestDto,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederCardResponseDto>>> {
        const result = await this.exploreBreedersUseCase.execute(searchDto, userId);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            BREEDER_RESPONSE_MESSAGES.breederListRetrieved,
        );
    }
}
