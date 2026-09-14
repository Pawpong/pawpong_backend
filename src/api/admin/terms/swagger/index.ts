import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { TERMS_RESPONSE_MESSAGE_EXAMPLES } from '../../../service/terms/constants/terms-response-messages';
import {
    TERMS_ADMIN_ACTIVE_DELETE_CONFLICT_RESPONSE,
    TERMS_ADMIN_DUPLICATE_VERSION_RESPONSE,
    TERMS_ADMIN_FORBIDDEN_RESPONSE,
    TERMS_ADMIN_NOT_FOUND_RESPONSE,
} from '../../../service/terms/constants/terms-swagger.constants';
import { TermsCreateRequestDto } from '../../../service/terms/dto/request/terms-create-request.dto';
import { TermsUpdateRequestDto } from '../../../service/terms/dto/request/terms-update-request.dto';
import { TermsResponseDto } from '../../../service/terms/dto/response/terms-response.dto';

export function ApiTermsAdminController() {
    return ApiController('약관 관리 (Admin)');
}

export function ApiCreateTermsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '약관 생성',
            description: `
                새 약관 버전을 생성합니다.

                ## 주요 기능
                - code + version 조합은 유일해야 합니다.
                - activate 를 true 로 주면 생성과 동시에 활성화하고, 같은 code 의 기존 활성 버전은 비활성화됩니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: TermsResponseDto,
            successDescription: '약관 생성 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.termsCreated,
            errorResponses: [TERMS_ADMIN_FORBIDDEN_RESPONSE, TERMS_ADMIN_DUPLICATE_VERSION_RESPONSE],
        }),
        ApiBody({ type: TermsCreateRequestDto }),
    );
}

export function ApiGetTermsListAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '약관 전체 목록 조회 (관리자)',
            description: `
                모든 약관 버전을 조회합니다. 비활성(과거/초안) 버전도 함께 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: [TermsResponseDto],
            successDescription: '약관 목록 조회 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.termsListRetrieved,
            errorResponses: [TERMS_ADMIN_FORBIDDEN_RESPONSE],
        }),
    );
}

export function ApiGetTermsDetailAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '약관 상세 조회 (관리자)',
            description: `
                특정 약관 버전의 상세 정보를 조회합니다 (비활성 버전 포함).

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: TermsResponseDto,
            successDescription: '약관 조회 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.termsDetailRetrieved,
            errorResponses: [
                TERMS_ADMIN_FORBIDDEN_RESPONSE,
                TERMS_ADMIN_NOT_FOUND_RESPONSE,
                TERMS_ADMIN_ACTIVE_DELETE_CONFLICT_RESPONSE,
            ],
        }),
        ApiParam({
            name: 'termsId',
            description: '조회할 약관 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiUpdateTermsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '약관 수정',
            description: `
                기존 약관 버전의 내용을 수정합니다.

                ## 수정 가능 필드
                - title
                - body
                - isRequired

                code, version 은 문서의 정체성이라 수정할 수 없습니다 — 새 버전이 필요하면 생성 API를 쓰세요.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: TermsResponseDto,
            successDescription: '약관 수정 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.termsUpdated,
            errorResponses: [TERMS_ADMIN_FORBIDDEN_RESPONSE, TERMS_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'termsId',
            description: '수정할 약관 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: TermsUpdateRequestDto }),
    );
}

export function ApiActivateTermsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '약관 활성화',
            description: `
                이 약관 버전을 활성화합니다. 같은 code 의 기존 활성 버전은 자동으로 비활성화됩니다
                (코드당 활성 버전은 항상 1개).

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: TermsResponseDto,
            successDescription: '약관 활성화 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.termsActivated,
            errorResponses: [TERMS_ADMIN_FORBIDDEN_RESPONSE, TERMS_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'termsId',
            description: '활성화할 약관 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}

export function ApiDeleteTermsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '약관 삭제',
            description: `
                약관 버전을 삭제합니다.

                ## 주의사항
                - 삭제된 약관은 복구할 수 없습니다.
                - **활성 상태인 약관은 삭제할 수 없습니다.** 활성 약관이 사라지면 해당 코드의 동의를
                  받을 수 없어 입양자 회원가입이 막힙니다. 다른 버전을 먼저 활성화한 뒤 삭제하세요.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '약관 삭제 성공',
            successMessageExample: TERMS_RESPONSE_MESSAGE_EXAMPLES.termsDeleted,
            nullableData: true,
            errorResponses: [TERMS_ADMIN_FORBIDDEN_RESPONSE, TERMS_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'termsId',
            description: '삭제할 약관 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
