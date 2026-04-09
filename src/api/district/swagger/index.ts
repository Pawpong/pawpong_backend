import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { GetDistrictsResponseDto } from '../dto/response/get-districts-response.dto';

export function ApiDistrictController() {
    return ApiPublicController('지역 관리');
}

export function ApiGetAllDistrictsEndpoint() {
    return ApiEndpoint({
        summary: '모든 지역 데이터 조회',
        description: '대한민국의 모든 지역(province와 cities) 데이터를 조회합니다.',
        responseType: GetDistrictsResponseDto,
        isPublic: true,
    });
}
