import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { StatsType } from '../../../../common/enum/user.enum';
import { PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/platform-admin-response-messages';
import { PLATFORM_ADMIN_FORBIDDEN_RESPONSE } from '../constants/platform-admin-swagger.constants';
import { AdminStatsResponseDto } from '../dto/response/admin-stats-response.dto';
import { MvpStatsResponseDto } from '../dto/response/mvp-stats-response.dto';

export function ApiPlatformAdminController() {
    return ApiController('플랫폼 관리자');
}

export function ApiGetPlatformStatsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '플랫폼 통계 조회',
            description: `
                플랫폼 전체 통계 정보를 조회합니다.

                ## 주요 기능
                - 사용자, 입양 신청, 인기 품종, 지역별 통계, 브리더 성과 랭킹을 제공합니다.
                - 날짜 범위와 통계 유형 필터를 적용할 수 있습니다.
                - 일부 컬렉션은 페이지네이션 크기 기준으로 잘라서 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: AdminStatsResponseDto,
            successDescription: '플랫폼 통계 조회 성공',
            successMessageExample: PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformStatsRetrieved,
            errorResponses: [PLATFORM_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'statsType', required: false, enum: StatsType, description: '통계 집계 단위', example: StatsType.DAILY }),
        ApiQuery({ name: 'startDate', required: false, type: String, description: '조회 시작일', example: '2025-01-01' }),
        ApiQuery({ name: 'endDate', required: false, type: String, description: '조회 종료일', example: '2025-01-31' }),
        ApiQuery({ name: 'pageNumber', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'itemsPerPage', required: false, type: Number, description: '페이지당 항목 수', example: 10 }),
    );
}

export function ApiGetPlatformMvpStatsEndpoint() {
    return ApiEndpoint({
        summary: 'MVP 통계 조회',
        description: `
            MVP 단계에서 필요한 핵심 운영 지표를 조회합니다.

            ## 주요 기능
            - 최근 7/14/28일 활성 사용자 통계를 제공합니다.
            - 상담/입양 신청 추이, 필터 사용, 브리더 재제출 비율을 확인할 수 있습니다.

            ## 권한
            - 관리자(admin) 권한이 필요합니다.
        `,
        responseType: MvpStatsResponseDto,
        successDescription: 'MVP 통계 조회 성공',
        successMessageExample: PLATFORM_ADMIN_RESPONSE_MESSAGE_EXAMPLES.platformMvpStatsRetrieved,
        errorResponses: [PLATFORM_ADMIN_FORBIDDEN_RESPONSE],
    });
}
