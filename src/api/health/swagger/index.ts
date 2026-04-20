import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { HEALTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/health-response-messages';
import { HealthCheckResponseDto } from '../dto/response/health-check-response.dto';

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
