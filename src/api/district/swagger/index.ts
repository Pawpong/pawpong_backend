import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { GetDistrictsResponseDto } from '../dto/response/get-districts-response.dto';

export function ApiDistrictController() {
    return ApiPublicController('지역');
}

export function ApiGetAllDistrictsEndpoint() {
    return ApiEndpoint({
        summary: '모든 지역 데이터 조회',
        description: `
            대한민국의 모든 지역(province와 cities) 데이터를 조회합니다.

            ## 주요 기능
            - 시/도 단위로 구분된 지역 목록을 반환합니다.
            - 각 시/도별 시/군/구 하위 목록을 함께 반환합니다.
            - 브리더 검색 필터에서 지역 선택 시 사용합니다.

            ## 인증 불필요
            - 이 API는 인증 없이 호출할 수 있습니다.
        `,
        responseType: GetDistrictsResponseDto,
        isPublic: true,
        successDescription: '지역 목록 조회 성공',
        successMessageExample: '지역 목록을 조회했습니다.',
    });
}
