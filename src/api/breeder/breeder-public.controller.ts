import { Get, Param, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { SearchBreedersUseCase } from './application/use-cases/search-breeders.use-case';
import { GetPopularBreedersUseCase } from './application/use-cases/get-popular-breeders.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederApplicationFormUseCase } from './application/use-cases/get-breeder-application-form.use-case';
import { BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { PetDetailResponseDto } from './dto/response/pet-detail-response.dto';
import { BreederCardResponseDto } from './dto/response/breeder-card-response.dto';
import { BreederSearchResponseDto } from './dto/response/breeder-search-response.dto';
import { PublicApplicationFormResponseDto } from './dto/response/public-application-form.dto';
import {
    ApiGetBreederApplicationFormEndpoint,
    ApiGetBreederPetDetailEndpoint,
    ApiGetPopularBreedersEndpoint,
    ApiSearchBreedersEndpoint,
} from './swagger/decorators';

@BreederPublicController()
export class BreederPublicHttpController {
    constructor(
        private readonly searchBreedersUseCase: SearchBreedersUseCase,
        private readonly getPopularBreedersUseCase: GetPopularBreedersUseCase,
        private readonly getBreederPetDetailUseCase: GetBreederPetDetailUseCase,
        private readonly getBreederApplicationFormUseCase: GetBreederApplicationFormUseCase,
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

    @Get(':id/pet/:petId')
    @ApiGetBreederPetDetailEndpoint()
    async getPetDetail(
        @Param('id') breederId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetDetailResponseDto>> {
        const result = await this.getBreederPetDetailUseCase.execute(breederId, petId);
        return ApiResponseDto.success(result, '개체 상세 정보가 조회되었습니다.');
    }

    @Get(':id/application-form')
    @ApiGetBreederApplicationFormEndpoint()
    async getApplicationForm(
        @Param('id') breederId: string,
    ): Promise<ApiResponseDto<PublicApplicationFormResponseDto>> {
        const result = await this.getBreederApplicationFormUseCase.execute(breederId);
        return ApiResponseDto.success(result, '입양 신청 폼 구조가 조회되었습니다.');
    }
}
