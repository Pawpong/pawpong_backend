import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { APP_VERSION_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/app-version-response-messages';
import {
    APP_VERSION_ADMIN_FORBIDDEN_RESPONSE,
    APP_VERSION_ADMIN_NOT_FOUND_RESPONSE,
} from '../../constants/app-version-swagger.constants';
import { AppVersionCreateRequestDto } from '../../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../../dto/response/app-version-response.dto';

export function ApiAppVersionAdminController() {
    return ApiController('앱 버전 관리 (Admin)');
}

export function ApiCreateAppVersionAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '앱 버전 생성',
            description: `
                iOS 또는 Android 앱 버전 정보를 생성합니다.

                ## 주요 기능
                - 최신 버전, 최소 요구 버전, 업데이트 메시지를 함께 저장합니다.
                - isActive가 true면 앱 버전 체크에 즉시 반영됩니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: AppVersionResponseDto,
            successDescription: '앱 버전 생성 성공',
            successMessageExample: APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionCreated,
            errorResponses: [APP_VERSION_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiBody({ type: AppVersionCreateRequestDto }),
    );
}

export function ApiGetAppVersionListAdminEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '앱 버전 목록 조회',
            description: `
                모든 플랫폼의 앱 버전 목록을 최신순으로 조회합니다.

                ## 주요 기능
                - iOS와 Android 버전을 함께 조회합니다.
                - 페이지네이션을 지원합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: PaginationResponseDto,
            itemType: AppVersionResponseDto,
            successDescription: '앱 버전 목록 조회 성공',
            successMessageExample: APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionListRetrieved,
            errorResponses: [APP_VERSION_ADMIN_FORBIDDEN_RESPONSE],
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 }),
    );
}

export function ApiUpdateAppVersionAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '앱 버전 수정',
            description: `
                기존 앱 버전 정보를 수정합니다.

                ## 주요 기능
                - 버전 정보, 스토어 URL, 업데이트 메시지, 활성 여부를 수정할 수 있습니다.
                - 존재하지 않는 버전 ID는 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            responseType: AppVersionResponseDto,
            successDescription: '앱 버전 수정 성공',
            successMessageExample: APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionUpdated,
            errorResponses: [APP_VERSION_ADMIN_FORBIDDEN_RESPONSE, APP_VERSION_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'appVersionId',
            description: '수정할 앱 버전 ID',
            example: '507f1f77bcf86cd799439011',
        }),
        ApiBody({ type: AppVersionUpdateRequestDto }),
    );
}

export function ApiDeleteAppVersionAdminEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '앱 버전 삭제',
            description: `
                앱 버전 정보를 삭제합니다.

                ## 주의사항
                - 삭제된 버전 정보는 복구할 수 없습니다.
                - 존재하지 않는 버전 ID는 예외를 반환합니다.

                ## 권한
                - 관리자(admin) 권한이 필요합니다.
            `,
            successDescription: '앱 버전 삭제 성공',
            successMessageExample: APP_VERSION_RESPONSE_MESSAGE_EXAMPLES.appVersionDeleted,
            nullableData: true,
            errorResponses: [APP_VERSION_ADMIN_FORBIDDEN_RESPONSE, APP_VERSION_ADMIN_NOT_FOUND_RESPONSE],
        }),
        ApiParam({
            name: 'appVersionId',
            description: '삭제할 앱 버전 ID',
            example: '507f1f77bcf86cd799439011',
        }),
    );
}
