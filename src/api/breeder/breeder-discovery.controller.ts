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
        return ApiResponseDto.success(result, '브리더 검색이 완료되었습니다.');
    }

    @Get('popular')
    @ApiGetPopularBreedersEndpoint()
    async getPopularBreeders(): Promise<ApiResponseDto<BreederCardResponseDto[]>> {
        const result = await this.getPopularBreedersUseCase.execute(10);
        return ApiResponseDto.success(result, '인기 브리더 목록이 조회되었습니다.');
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
        return ApiResponseDto.success(result, '브리더 목록이 조회되었습니다.');
    }
}
