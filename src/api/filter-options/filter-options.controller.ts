import { Controller, Get } from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';

import {
    AdoptionStatusOptionDto,
    AllFilterOptionsResponseDto,
    BreederLevelOptionDto,
    CatFurLengthOptionDto,
    DogSizeOptionDto,
    SortOptionDto,
} from './dto/response/filter-options-response.dto';
import { GetAdoptionStatusUseCase } from './application/use-cases/get-adoption-status.use-case';
import { GetAllFilterOptionsUseCase } from './application/use-cases/get-all-filter-options.use-case';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { GetSortOptionsUseCase } from './application/use-cases/get-sort-options.use-case';

@ApiController('필터 옵션')
@Controller('filter-options')
export class FilterOptionsController {
    constructor(
        private readonly getAllFilterOptionsUseCase: GetAllFilterOptionsUseCase,
        private readonly getBreederLevelsUseCase: GetBreederLevelsUseCase,
        private readonly getSortOptionsUseCase: GetSortOptionsUseCase,
        private readonly getDogSizesUseCase: GetDogSizesUseCase,
        private readonly getCatFurLengthsUseCase: GetCatFurLengthsUseCase,
        private readonly getAdoptionStatusUseCase: GetAdoptionStatusUseCase,
    ) {}

    @Get()
    @ApiEndpoint({
        summary: '전체 필터 옵션 조회',
        description: '브리더 검색에 사용되는 모든 필터 옵션을 한번에 조회합니다.',
        responseType: AllFilterOptionsResponseDto,
        isPublic: true,
    })
    async getAllFilterOptions(): Promise<ApiResponseDto<AllFilterOptionsResponseDto>> {
        const result = await this.getAllFilterOptionsUseCase.execute();
        return ApiResponseDto.success(result, '필터 옵션이 조회되었습니다.');
    }

    @Get('breeder-levels')
    @ApiEndpoint({
        summary: '브리더 레벨 옵션 조회',
        description: '브리더 레벨 필터 옵션 목록을 조회합니다.',
        responseType: [BreederLevelOptionDto],
        isPublic: true,
    })
    async getBreederLevels(): Promise<ApiResponseDto<BreederLevelOptionDto[]>> {
        const result = await this.getBreederLevelsUseCase.execute();
        return ApiResponseDto.success(result, '브리더 레벨 옵션이 조회되었습니다.');
    }

    @Get('sort-options')
    @ApiEndpoint({
        summary: '정렬 옵션 조회',
        description: '브리더 목록 정렬 옵션을 조회합니다.',
        responseType: [SortOptionDto],
        isPublic: true,
    })
    async getSortOptions(): Promise<ApiResponseDto<SortOptionDto[]>> {
        const result = await this.getSortOptionsUseCase.execute();
        return ApiResponseDto.success(result, '정렬 옵션이 조회되었습니다.');
    }

    @Get('dog-sizes')
    @ApiEndpoint({
        summary: '강아지 크기 옵션 조회',
        description: '강아지 크기 필터 옵션을 조회합니다.',
        responseType: [DogSizeOptionDto],
        isPublic: true,
    })
    async getDogSizes(): Promise<ApiResponseDto<DogSizeOptionDto[]>> {
        const result = await this.getDogSizesUseCase.execute();
        return ApiResponseDto.success(result, '강아지 크기 옵션이 조회되었습니다.');
    }

    @Get('cat-fur-lengths')
    @ApiEndpoint({
        summary: '고양이 털 길이 옵션 조회',
        description: '고양이 털 길이 필터 옵션을 조회합니다.',
        responseType: [CatFurLengthOptionDto],
        isPublic: true,
    })
    async getCatFurLengths(): Promise<ApiResponseDto<CatFurLengthOptionDto[]>> {
        const result = await this.getCatFurLengthsUseCase.execute();
        return ApiResponseDto.success(result, '고양이 털 길이 옵션이 조회되었습니다.');
    }

    @Get('adoption-status')
    @ApiEndpoint({
        summary: '입양 가능 여부 옵션 조회',
        description: '입양 가능 여부 필터 옵션을 조회합니다.',
        responseType: [AdoptionStatusOptionDto],
        isPublic: true,
    })
    async getAdoptionStatus(): Promise<ApiResponseDto<AdoptionStatusOptionDto[]>> {
        const result = await this.getAdoptionStatusUseCase.execute();
        return ApiResponseDto.success(result, '입양 가능 여부 옵션이 조회되었습니다.');
    }
}
