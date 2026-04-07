import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';

import {
    AdoptionStatusOptionDto,
    AllFilterOptionsResponseDto,
    BreederLevelOptionDto,
    CatFurLengthOptionDto,
    DogSizeOptionDto,
    SortOptionDto,
} from '../dto/response/filter-options-response.dto';

export function ApiFilterOptionsController() {
    return ApiController('필터 옵션');
}

export function ApiGetAllFilterOptionsEndpoint() {
    return ApiEndpoint({
        summary: '전체 필터 옵션 조회',
        description: '브리더 검색에 사용되는 모든 필터 옵션을 한번에 조회합니다.',
        responseType: AllFilterOptionsResponseDto,
        isPublic: true,
    });
}

export function ApiGetBreederLevelsEndpoint() {
    return ApiEndpoint({
        summary: '브리더 레벨 옵션 조회',
        description: '브리더 레벨 필터 옵션 목록을 조회합니다.',
        responseType: [BreederLevelOptionDto],
        isPublic: true,
    });
}

export function ApiGetSortOptionsEndpoint() {
    return ApiEndpoint({
        summary: '정렬 옵션 조회',
        description: '브리더 목록 정렬 옵션을 조회합니다.',
        responseType: [SortOptionDto],
        isPublic: true,
    });
}

export function ApiGetDogSizesEndpoint() {
    return ApiEndpoint({
        summary: '강아지 크기 옵션 조회',
        description: '강아지 크기 필터 옵션을 조회합니다.',
        responseType: [DogSizeOptionDto],
        isPublic: true,
    });
}

export function ApiGetCatFurLengthsEndpoint() {
    return ApiEndpoint({
        summary: '고양이 털 길이 옵션 조회',
        description: '고양이 털 길이 필터 옵션을 조회합니다.',
        responseType: [CatFurLengthOptionDto],
        isPublic: true,
    });
}

export function ApiGetAdoptionStatusEndpoint() {
    return ApiEndpoint({
        summary: '입양 가능 여부 옵션 조회',
        description: '입양 가능 여부 필터 옵션을 조회합니다.',
        responseType: [AdoptionStatusOptionDto],
        isPublic: true,
    });
}
