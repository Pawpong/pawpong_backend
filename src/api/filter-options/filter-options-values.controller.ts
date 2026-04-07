import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAdoptionStatusUseCase } from './application/use-cases/get-adoption-status.use-case';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { GetSortOptionsUseCase } from './application/use-cases/get-sort-options.use-case';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import {
    AdoptionStatusOptionDto,
    BreederLevelOptionDto,
    CatFurLengthOptionDto,
    DogSizeOptionDto,
    SortOptionDto,
} from './dto/response/filter-options-response.dto';
import {
    ApiGetAdoptionStatusEndpoint,
    ApiGetBreederLevelsEndpoint,
    ApiGetCatFurLengthsEndpoint,
    ApiGetDogSizesEndpoint,
    ApiGetSortOptionsEndpoint,
} from './swagger';

@FilterOptionsController()
export class FilterOptionsValuesController {
    constructor(
        private readonly getBreederLevelsUseCase: GetBreederLevelsUseCase,
        private readonly getSortOptionsUseCase: GetSortOptionsUseCase,
        private readonly getDogSizesUseCase: GetDogSizesUseCase,
        private readonly getCatFurLengthsUseCase: GetCatFurLengthsUseCase,
        private readonly getAdoptionStatusUseCase: GetAdoptionStatusUseCase,
    ) {}

    @Get('breeder-levels')
    @ApiGetBreederLevelsEndpoint()
    async getBreederLevels(): Promise<ApiResponseDto<BreederLevelOptionDto[]>> {
        const result = await this.getBreederLevelsUseCase.execute();
        return ApiResponseDto.success(result, '브리더 레벨 옵션이 조회되었습니다.');
    }

    @Get('sort-options')
    @ApiGetSortOptionsEndpoint()
    async getSortOptions(): Promise<ApiResponseDto<SortOptionDto[]>> {
        const result = await this.getSortOptionsUseCase.execute();
        return ApiResponseDto.success(result, '정렬 옵션이 조회되었습니다.');
    }

    @Get('dog-sizes')
    @ApiGetDogSizesEndpoint()
    async getDogSizes(): Promise<ApiResponseDto<DogSizeOptionDto[]>> {
        const result = await this.getDogSizesUseCase.execute();
        return ApiResponseDto.success(result, '강아지 크기 옵션이 조회되었습니다.');
    }

    @Get('cat-fur-lengths')
    @ApiGetCatFurLengthsEndpoint()
    async getCatFurLengths(): Promise<ApiResponseDto<CatFurLengthOptionDto[]>> {
        const result = await this.getCatFurLengthsUseCase.execute();
        return ApiResponseDto.success(result, '고양이 털 길이 옵션이 조회되었습니다.');
    }

    @Get('adoption-status')
    @ApiGetAdoptionStatusEndpoint()
    async getAdoptionStatus(): Promise<ApiResponseDto<AdoptionStatusOptionDto[]>> {
        const result = await this.getAdoptionStatusUseCase.execute();
        return ApiResponseDto.success(result, '입양 가능 여부 옵션이 조회되었습니다.');
    }
}
