import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AdminLoginResponseDto } from '../../dto/response/admin-login-response.dto';

const AUTH_ADMIN_UNAUTHORIZED_RESPONSE = {
    status: 401,
    description: '인증 실패',
    errorExample: '이메일 또는 비밀번호가 올바르지 않습니다.',
};

export function ApiAuthAdminController() {
    return applyDecorators(ApiTags('인증 관리 (Admin)'));
}

export function ApiAdminLoginEndpoint() {
    return ApiEndpoint({
        summary: '관리자 로그인',
        description: `
            이메일과 비밀번호로 관리자 인증 후 JWT 토큰을 발급합니다.

            ## 주요 기능
            - Access Token과 Refresh Token을 함께 반환합니다.
            - 관리자 등급 및 권한 정보도 함께 제공합니다.
        `,
        responseType: AdminLoginResponseDto,
        isPublic: true,
        successDescription: '관리자 로그인 성공',
        successMessageExample: '관리자 로그인이 완료되었습니다.',
        errorResponses: [AUTH_ADMIN_UNAUTHORIZED_RESPONSE],
    });
}

export function ApiRefreshAdminTokenEndpoint() {
    return ApiEndpoint({
        summary: '관리자 토큰 갱신',
        description: `
            Refresh Token을 사용해 새로운 관리자 Access Token을 발급합니다.

            ## 주요 기능
            - 만료된 Access Token을 교체할 때 사용합니다.
            - 응답에는 새 Access Token만 포함됩니다.
        `,
        isPublic: true,
        successDescription: '관리자 토큰 갱신 성공',
        successMessageExample: '토큰이 갱신되었습니다.',
        dataSchema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
            },
            required: ['accessToken'],
        },
        errorResponses: [
            {
                status: 401,
                description: '유효하지 않은 토큰',
                errorExample: '유효하지 않은 토큰입니다.',
            },
        ],
    });
}
