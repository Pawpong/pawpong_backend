import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { VerificationStatus } from '../../../../../common/enum/user.enum';
import { BreederDetailResponseDto } from '../dto/response/breeder-detail-response.dto';
import { BreederLevelChangeResponseDto } from '../dto/response/breeder-level-change-response.dto';
import { BreederStatsResponseDto } from '../dto/response/breeder-stats-response.dto';
import { BreederVerificationResponseDto } from '../dto/response/breeder-verification-response.dto';

const BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '관리자 권한이 필요합니다.',
};

function buildBreederSearchQueries() {
    return [
        ApiQuery({
            name: 'verificationStatus',
            required: false,
            enum: VerificationStatus,
            description: '인증 상태 필터',
        }),
        ApiQuery({ name: 'cityName', required: false, type: String, description: '도시 이름 필터' }),
        ApiQuery({ name: 'searchKeyword', required: false, type: String, description: '이름/이메일 검색어' }),
        ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: '페이지 번호' }),
        ApiQuery({ name: 'itemsPerPage', required: false, type: Number, example: 10, description: '페이지당 항목 수' }),
    ];
}

export function ApiBreederVerificationAdminController() {
    return ApiController('브리더 인증 관리 (Admin)');
}

export function ApiGetBreedersAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '브리더 목록 조회 (통합 검색)',
            description: '전체 브리더 목록을 조회합니다. 상태, 도시, 키워드 필터링을 지원합니다.',
            responseType: PaginationResponseDto,
            itemType: BreederVerificationResponseDto,
            errorResponses: [BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE],
            successMessageExample: '브리더 목록이 조회되었습니다.',
        }),
        ...buildBreederSearchQueries(),
    );
}

export function ApiGetPendingBreederVerificationsAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '승인 대기 브리더 목록 조회',
            description: '인증 승인을 대기중인 브리더 목록을 조회합니다.',
            responseType: PaginationResponseDto,
            itemType: BreederVerificationResponseDto,
            errorResponses: [BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE],
            successMessageExample: '승인 대기 브리더 목록이 조회되었습니다.',
        }),
        ...buildBreederSearchQueries(),
    );
}

export function ApiGetLevelChangeRequestsAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '레벨 변경 신청 목록 조회',
            description: '승인된 브리더가 제출한 레벨 변경 신청 목록을 조회합니다 (New ↔ Elite).',
            responseType: PaginationResponseDto,
            itemType: BreederVerificationResponseDto,
            errorResponses: [BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE],
            successMessageExample: '레벨 변경 신청 목록이 조회되었습니다.',
        }),
        ...buildBreederSearchQueries(),
    );
}

export function ApiGetBreederDetailAdminEndpoint() {
    return ApiEndpoint({
        summary: '브리더 상세 정보 조회',
        description: '특정 브리더의 상세 정보를 조회합니다 (서류, 프로필 포함).',
        responseType: BreederDetailResponseDto,
        errorResponses: [
            BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE,
            {
                status: 404,
                description: '브리더를 찾을 수 없음',
                errorExample: '브리더를 찾을 수 없습니다.',
            },
        ],
        successMessageExample: '브리더 상세 정보가 조회되었습니다.',
    });
}

export function ApiUpdateBreederVerificationAdminEndpoint() {
    return ApiEndpoint({
        summary: '브리더 인증 승인/거절',
        description: '브리더의 인증 신청을 승인하거나 거절합니다.',
        dataSchema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Breeder verification approved',
                },
            },
            required: ['message'],
        },
        errorResponses: [
            BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE,
            {
                status: 404,
                description: '브리더를 찾을 수 없음',
                errorExample: '브리더를 찾을 수 없습니다.',
            },
        ],
        successMessageExample: '브리더 인증 처리가 완료되었습니다.',
    });
}

export function ApiGetBreederStatsAdminEndpoint() {
    return ApiEndpoint({
        summary: '승인된 브리더 통계 조회',
        description: '전체 승인된 브리더의 레벨별 통계를 조회합니다 (전체/엘리트/뉴).',
        responseType: BreederStatsResponseDto,
        errorResponses: [BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE],
        successMessageExample: '브리더 통계가 조회되었습니다.',
    });
}

export function ApiSendDocumentRemindersAdminEndpoint() {
    return ApiEndpoint({
        summary: '서류 미제출 브리더에게 독촉 메일 발송',
        description:
            '승인 후 4주 경과했지만 서류를 제출하지 않은 브리더들에게 독촉 이메일을 발송합니다. Cloud Run으로 스케줄링하여 사용할 수 있습니다.',
        dataSchema: {
            type: 'object',
            properties: {
                sentCount: { type: 'number', example: 3 },
                breederIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['507f1f77bcf86cd799439011'],
                },
            },
            required: ['sentCount', 'breederIds'],
        },
        errorResponses: [BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE],
    });
}

export function ApiChangeBreederLevelAdminEndpoint() {
    return ApiEndpoint({
        summary: '브리더 레벨 변경',
        description: '승인된 브리더의 레벨을 뉴 ↔ 엘리트로 변경합니다.',
        responseType: BreederLevelChangeResponseDto,
        errorResponses: [
            BREEDER_VERIFICATION_ADMIN_FORBIDDEN_RESPONSE,
            {
                status: 404,
                description: '브리더를 찾을 수 없음',
                errorExample: '브리더를 찾을 수 없습니다.',
            },
        ],
        successMessageExample: '브리더 레벨이 변경되었습니다.',
    });
}
