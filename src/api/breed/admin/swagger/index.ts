import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { BreedResponseDto } from '../../dto/response/breed-response.dto';

const BREED_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '품종을 찾을 수 없음',
    errorExample: '품종을 찾을 수 없습니다.',
};

export function ApiBreedAdminController() {
    return ApiController('품종 관리 (Admin)');
}

export function ApiCreateBreedAdminEndpoint() {
    return ApiEndpoint({
        summary: '품종 생성 (관리자)',
        description: `
            새로운 품종을 시스템에 추가합니다.

            ## 요청 본문
            - petType: 동물 종류 ('dog' 또는 'cat')
            - category: 품종 카테고리
            - categoryDescription: 카테고리 설명
            - breeds: 품종 목록
        `,
        responseType: BreedResponseDto,
    });
}

export function ApiGetAllBreedsAdminEndpoint() {
    return ApiEndpoint({
        summary: '모든 품종 조회 (관리자)',
        description: `
            시스템에 등록된 모든 품종 목록을 조회합니다.

            ## 주요 기능
            - 비공개 상태의 품종도 함께 반환됩니다.
        `,
        responseType: [BreedResponseDto],
    });
}

export function ApiGetBreedByIdAdminEndpoint() {
    return ApiEndpoint({
        summary: '특정 품종 조회 (관리자)',
        description: `
            ID를 사용하여 특정 품종의 상세 정보를 조회합니다.
        `,
        responseType: BreedResponseDto,
        errorResponses: [BREED_ADMIN_NOT_FOUND_RESPONSE],
    });
}

export function ApiUpdateBreedAdminEndpoint() {
    return ApiEndpoint({
        summary: '품종 정보 수정 (관리자)',
        description: `
            기존 품종의 정보를 수정합니다.

            ## 수정 가능 필드
            - category: 품종 카테고리
            - categoryDescription: 카테고리 설명
            - breeds: 품종 목록
        `,
        responseType: BreedResponseDto,
        errorResponses: [BREED_ADMIN_NOT_FOUND_RESPONSE],
    });
}

export function ApiDeleteBreedAdminEndpoint() {
    return ApiEndpoint({
        summary: '품종 삭제 (관리자)',
        description: `
            ID를 사용하여 특정 품종을 시스템에서 삭제합니다.

            ## 주의사항
            - 이 작업은 되돌릴 수 없습니다.
            - 해당 품종과 연결된 데이터가 있을 경우 문제가 발생할 수 있습니다.
        `,
        successMessageExample: '품종 카테고리가 삭제되었습니다.',
        nullableData: true,
        errorResponses: [BREED_ADMIN_NOT_FOUND_RESPONSE],
    });
}
