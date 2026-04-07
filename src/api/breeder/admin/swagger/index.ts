import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { BreederRemindResponseDto } from '../dto/response/breeder-remind-response.dto';
import { BreederSuspendResponseDto } from '../dto/response/breeder-suspend-response.dto';
import { SetTestAccountResponseDto } from '../dto/response/set-test-account-response.dto';

const BREEDER_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

const BREEDER_ADMIN_NOT_FOUND_RESPONSE = {
    status: 404,
    description: '브리더를 찾을 수 없음',
    errorExample: '브리더를 찾을 수 없습니다.',
};

export function ApiBreederAdminController() {
    return ApiController('브리더 관리 (Admin)');
}

export function ApiSuspendBreederAdminEndpoint() {
    return ApiEndpoint({
        summary: '브리더 제재 처리 (영구정지)',
        description: '브리더 계정을 영구정지 처리하고 알림을 발송합니다.',
        responseType: BreederSuspendResponseDto,
        errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_ADMIN_NOT_FOUND_RESPONSE],
        successMessageExample: '브리더 계정이 영구정지 처리되었습니다.',
    });
}

export function ApiUnsuspendBreederAdminEndpoint() {
    return ApiEndpoint({
        summary: '브리더 정지 해제',
        description: '정지된 브리더 계정을 활성화하고 알림을 발송합니다.',
        responseType: BreederSuspendResponseDto,
        errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_ADMIN_NOT_FOUND_RESPONSE],
        successMessageExample: '브리더 계정 정지가 해제되었습니다.',
    });
}

export function ApiSendBreederRemindNotificationsAdminEndpoint() {
    return ApiEndpoint({
        summary: '리마인드 알림 발송',
        description: '서류 미제출 브리더들에게 리마인드 알림을 발송합니다. (서비스 알림 + 이메일 알림)',
        responseType: BreederRemindResponseDto,
        errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiSetBreederTestAccountAdminEndpoint() {
    return ApiEndpoint({
        summary: '테스트 계정 설정',
        description:
            '브리더를 테스트 계정으로 설정하거나 해제합니다. 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.',
        responseType: SetTestAccountResponseDto,
        errorResponses: [BREEDER_ADMIN_FORBIDDEN_RESPONSE, BREEDER_ADMIN_NOT_FOUND_RESPONSE],
    });
}
