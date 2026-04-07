import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { ApiEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { AppVersionCheckResponseDto } from '../dto/response/app-version-check-response.dto';

const APP_VERSION_PLATFORM_VALUES = ['ios', 'android'] as const;
const APP_VERSION_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: 'platform 또는 currentVersion이 올바르지 않습니다.',
};

export function ApiAppVersionController() {
    return ApiPublicController('앱 버전');
}

export function ApiCheckAppVersionEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '앱 버전 체크',
            description: `
                RN 앱 시작 시 현재 버전을 기준으로 강제 업데이트 여부를 확인합니다.

                ## 주요 기능
                - 플랫폼별 최신 버전 정책을 조회합니다.
                - 최소 지원 버전보다 낮으면 강제 업데이트 여부를 반환합니다.
                - 권장 업데이트 버전과 비교해 안내 메시지를 내려줍니다.
            `,
            responseType: AppVersionCheckResponseDto,
            isPublic: true,
            successDescription: '버전 체크 성공',
            successMessageExample: '버전 체크 완료',
            errorResponses: [APP_VERSION_BAD_REQUEST_RESPONSE],
        }),
        ApiQuery({
            name: 'platform',
            enum: APP_VERSION_PLATFORM_VALUES,
            required: true,
            description: '플랫폼 구분',
            example: 'ios',
        }),
        ApiQuery({
            name: 'currentVersion',
            type: String,
            required: true,
            description: '현재 앱 버전',
            example: '1.0.0',
        }),
    );
}
