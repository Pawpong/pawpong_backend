import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { SystemHealthResponseDto } from '../dto/response/system-health-response.dto';

/**
 * GET /platform-admin/system-health Swagger 명세
 */
export function ApiGetSystemHealthEndpoint() {
    return applyDecorators(
        ApiOperation({
            summary: '시스템 헬스 조회',
            description: `
서버에서 발생한 로그를 분석하여 PM이 읽기 쉬운 형태의 시스템 상태를 반환합니다.

**분류 카테고리:**
- \`infrastructure\` — Kafka, Redis 등 인프라 연결 오류
- \`api_error\` — API 엔드포인트 오류
- \`security_probe\` — 외부 봇/스캐너 스캔 (서비스 영향 없음)
- \`application\` — 애플리케이션 내부 오류

**해결 판단 기준:** 마지막 발생 후 30분 이상 재발 없으면 \`isResolved: true\`

**서비스 상태 판단 기준:**
- 마지막 에러 1시간 이내 → \`error\`
- 마지막 에러 1시간 초과 → \`warning\`
- 에러 없음 → \`healthy\`
            `.trim(),
        }),
        ApiQuery({
            name: 'periodHours',
            required: false,
            description: '조회 기간 (시간 단위). 기본 24시간, 최대 168시간(7일)',
            example: 24,
            type: Number,
        }),
        ApiResponse({
            status: 200,
            description: '시스템 헬스 조회 성공',
            type: SystemHealthResponseDto,
        }),
        ApiResponse({ status: 403, description: '통계 조회 권한 없음' }),
    );
}
