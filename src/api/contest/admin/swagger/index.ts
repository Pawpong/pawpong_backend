import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';

const TAG = '콘테스트 관리자';

export function ApiContestAdminController() {
    return ApiController(TAG);
}

export function ApiUpdateContestEntryStatusEndpoint() {
    return ApiEndpoint({
        summary: '콘테스트 항목 상태 변경',
        description: `부적절한 사진을 숨김 또는 소프트 삭제 처리합니다.
- hidden: 목록 미노출, 데이터 보존
- deleted: 소프트 삭제, 복원 불가
- 이미 deleted 상태인 항목은 변경 불가`,
    });
}
