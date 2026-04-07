import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { DistrictResponseDto } from '../../dto/response/district-response.dto';

const DISTRICT_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '지역을 찾을 수 없음',
    errorExample: '지역을 찾을 수 없습니다.',
};

export function ApiDistrictAdminController() {
    return ApiController('지역 관리 (Admin)');
}

export function ApiCreateDistrictAdminEndpoint() {
    return ApiEndpoint({
        summary: '지역 생성',
        description: '새로운 지역을 생성합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
    });
}

export function ApiGetAllDistrictsAdminEndpoint() {
    return ApiEndpoint({
        summary: '모든 지역 조회',
        description: '모든 지역을 조회합니다. (관리자 전용)',
        responseType: [DistrictResponseDto],
    });
}

export function ApiGetDistrictByIdAdminEndpoint() {
    return ApiEndpoint({
        summary: '특정 지역 조회',
        description: 'ID로 특정 지역을 조회합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
        errorResponses: [DISTRICT_ADMIN_NOT_FOUND_RESPONSE],
    });
}

export function ApiUpdateDistrictAdminEndpoint() {
    return ApiEndpoint({
        summary: '지역 수정',
        description: '기존 지역을 수정합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
        errorResponses: [DISTRICT_ADMIN_NOT_FOUND_RESPONSE],
    });
}

export function ApiDeleteDistrictAdminEndpoint() {
    return ApiEndpoint({
        summary: '지역 삭제',
        description: '기존 지역을 삭제합니다. (관리자 전용)',
        nullableData: true,
        successMessageExample: '지역이 삭제되었습니다.',
        errorResponses: [DISTRICT_ADMIN_NOT_FOUND_RESPONSE],
    });
}
