import { ApiEndpoint, ApiPublicController } from '../../../../common/decorator/swagger.decorator';
import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/health-response-messages';
import { HealthCheckResponseDto } from '../dto/response/health-check-response.dto';
import { ReadinessCheckResponseDto } from '../dto/response/readiness-check-response.dto';

export function ApiHealthController() {
    return ApiPublicController('시스템');
}

export function ApiGetHealthEndpoint() {
    return ApiEndpoint({
        summary: '헬스체크',
        description: '시스템 상태를 확인합니다.',
        responseType: HealthCheckResponseDto,
        isPublic: true,
        successDescription: '헬스체크 성공',
        successMessageExample: HEALTH_RESPONSE_MESSAGE_EXAMPLES.healthChecked,
    });
}

export function ApiGetReadinessEndpoint() {
    return ApiEndpoint({
        summary: '준비 상태 확인',
        description: '프로세스 liveness와 별개로 MongoDB ping을 포함한 요청 처리 준비 상태를 확인합니다.',
        responseType: ReadinessCheckResponseDto,
        isPublic: true,
        successDescription: '서비스 준비 완료',
        successMessageExample: HEALTH_RESPONSE_MESSAGE_EXAMPLES.readinessChecked,
        errorResponses: [
            {
                status: 503,
                description: '데이터베이스 연결을 사용할 수 없음',
                errorExample: HEALTH_RESPONSE_MESSAGE_EXAMPLES.readinessFailed,
            },
        ],
    });
}
