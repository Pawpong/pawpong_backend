import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { ALIMTALK_ADMIN_RESPONSE_MESSAGES } from '../constants/alimtalk-admin-response-messages';
import { TemplateCreateRequestDto } from '../dto/request/template-create-request.dto';
import { TemplateUpdateRequestDto } from '../dto/request/template-update-request.dto';
import { TemplateActionResponseDto } from '../dto/response/template-action-response.dto';
import { TemplateDetailResponseDto } from '../dto/response/template-detail-response.dto';
import { TemplateListResponseDto } from '../dto/response/template-list-response.dto';

function ApiTemplateCodeParam() {
    return ApiParam({
        name: 'templateCode',
        description: '알림톡 템플릿 코드',
        example: 'VERIFICATION_CODE',
    });
}

export function ApiAlimtalkAdminController() {
    return ApiController('알림톡 관리 (Admin)');
}

export function ApiGetAlimtalkTemplatesEndpoint() {
    return ApiEndpoint({
        summary: '알림톡 템플릿 목록 조회',
        description: '등록된 모든 알림톡 템플릿 목록을 조회합니다.',
        responseType: TemplateListResponseDto,
        successDescription: '템플릿 목록 조회 성공',
        successMessageExample: ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateListRetrieved,
        errorResponses: [{ status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' }],
    });
}

export function ApiGetAlimtalkTemplateByCodeEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '알림톡 템플릿 상세 조회',
            description: '특정 템플릿의 상세 정보를 조회합니다.',
            responseType: TemplateDetailResponseDto,
            successDescription: '템플릿 상세 조회 성공',
            successMessageExample: ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateDetailRetrieved,
            errorResponses: [
                { status: 404, description: '템플릿을 찾을 수 없음', errorExample: '템플릿을 찾을 수 없습니다.' },
                { status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' },
            ],
        }),
        ApiTemplateCodeParam(),
    );
}

export function ApiUpdateAlimtalkTemplateEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '알림톡 템플릿 수정',
            description: '특정 템플릿의 정보를 수정합니다. 수정 후 자동으로 캐시가 갱신됩니다.',
            responseType: TemplateDetailResponseDto,
            successDescription: '템플릿 수정 성공',
            successMessageExample: ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateUpdated,
            errorResponses: [
                { status: 404, description: '템플릿을 찾을 수 없음', errorExample: '템플릿을 찾을 수 없습니다.' },
                { status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' },
            ],
        }),
        ApiTemplateCodeParam(),
        ApiBody({ type: TemplateUpdateRequestDto }),
    );
}

export function ApiCreateAlimtalkTemplateEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '알림톡 템플릿 생성',
            description: '검수 완료된 새 알림톡 템플릿을 등록합니다. 생성 후 자동으로 캐시가 갱신됩니다.',
            responseType: TemplateDetailResponseDto,
            successDescription: '템플릿 생성 성공',
            successMessageExample: ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateCreated,
            errorResponses: [
                { status: 409, description: '중복된 템플릿 코드', errorExample: '이미 존재하는 템플릿 코드입니다.' },
                { status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' },
            ],
        }),
        ApiBody({ type: TemplateCreateRequestDto }),
    );
}

export function ApiDeleteAlimtalkTemplateEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '알림톡 템플릿 삭제',
            description: '특정 템플릿을 완전히 삭제합니다. 삭제 후 자동으로 캐시가 갱신됩니다.',
            responseType: TemplateActionResponseDto,
            successDescription: '템플릿 삭제 성공',
            successMessageExample: ALIMTALK_ADMIN_RESPONSE_MESSAGES.templateDeleted,
            errorResponses: [
                { status: 404, description: '템플릿을 찾을 수 없음', errorExample: '템플릿을 찾을 수 없습니다.' },
                { status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' },
            ],
        }),
        ApiTemplateCodeParam(),
    );
}

export function ApiRefreshAlimtalkTemplateCacheEndpoint() {
    return ApiEndpoint({
        summary: '알림톡 템플릿 캐시 갱신',
        description: 'DB의 템플릿 정보를 메모리 캐시에 다시 로드합니다.',
        responseType: TemplateActionResponseDto,
        successDescription: '캐시 갱신 성공',
        successMessageExample: ALIMTALK_ADMIN_RESPONSE_MESSAGES.cacheRefreshed,
        errorResponses: [{ status: 403, description: '권한 없음', errorExample: '관리자 권한이 필요합니다.' }],
    });
}
