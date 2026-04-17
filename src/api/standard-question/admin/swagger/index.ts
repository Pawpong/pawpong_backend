import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from '../constants/standard-question-admin-response-messages';
import { STANDARD_QUESTION_ADMIN_NOT_FOUND_RESPONSE } from '../constants/standard-question-admin-swagger.constants';
import { ReorderStandardQuestionsDto } from '../dto/request/reorder-standard-questions.dto';
import { ToggleStandardQuestionStatusDto } from '../dto/request/toggle-standard-question-status.dto';
import { UpdateStandardQuestionDto } from '../dto/request/update-standard-question.dto';
import { StandardQuestionResponseDto } from '../dto/response/standard-question-response.dto';

export function ApiStandardQuestionAdminController() {
    return ApiController('입양 신청 질문 (Admin)');
}

export function ApiGetAllStandardQuestionsAdminEndpoint() {
    return ApiEndpoint({
        summary: '표준 질문 목록 조회 (관리자용)',
        description: `
            모든 표준 질문 목록을 조회합니다.

        ## 주요 기능
        - 비활성화된 질문을 포함한 모든 표준 질문을 반환합니다.
        `,
        responseType: [StandardQuestionResponseDto],
        successMessageExample: STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsRetrieved,
    });
}

export function ApiUpdateStandardQuestionAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '표준 질문 수정',
            description: `
                특정 ID를 가진 표준 질문의 내용을 수정합니다.

                ## 수정 가능 필드
                - type: 질문 타입
                - label: 질문 내용
                - required: 필수 여부
                - options: 선택지 (선택형 질문의 경우)
                - placeholder: 플레이스홀더
                - description: 추가 설명

            ## 참고
            - 'id'와 'order' 필드는 수정할 수 없습니다.
            `,
            responseType: StandardQuestionResponseDto,
            successMessageExample: STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionUpdated,
            errorResponses: [STANDARD_QUESTION_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '수정할 표준 질문 ID',
            example: 'privacyConsent',
        }),
        ApiBody({ type: UpdateStandardQuestionDto }),
    );
}

export function ApiToggleStandardQuestionStatusAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '표준 질문 활성화/비활성화',
            description: `
                특정 ID를 가진 표준 질문의 활성화 상태를 변경합니다.

            ## 요청 본문
            - isActive: true면 활성화, false면 비활성화됩니다.
            `,
            responseType: StandardQuestionResponseDto,
            successMessageExample: STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionStatusUpdated,
            errorResponses: [STANDARD_QUESTION_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'id',
            description: '활성화 상태를 바꿀 표준 질문 ID',
            example: 'privacyConsent',
        }),
        ApiBody({ type: ToggleStandardQuestionStatusDto }),
    );
}

export function ApiReorderStandardQuestionsAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '표준 질문 순서 변경',
            description: `
                표준 질문들의 순서를 일괄적으로 변경합니다.

                ## 요청 본문
                - reorderData: 질문의 id와 새로운 order를 담은 객체 배열
            `,
            dataSchema: {
                type: 'boolean',
                example: true,
            },
            successMessageExample: STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReordered,
        }),
        ApiBody({ type: ReorderStandardQuestionsDto }),
    );
}

export function ApiReseedStandardQuestionsAdminEndpoint() {
    return ApiEndpoint({
        summary: '표준 질문 재시딩',
        description: `
            모든 표준 질문을 시스템 초기 상태로 되돌립니다.

            ## 주의사항
            - 기존의 모든 표준 질문 데이터를 삭제하고 초기값으로 덮어씁니다.
            - 운영 환경에서는 극히 주의해서 사용해야 합니다.
        `,
        dataSchema: {
            type: 'boolean',
            example: true,
        },
        successMessageExample: STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsReseeded,
    });
}
