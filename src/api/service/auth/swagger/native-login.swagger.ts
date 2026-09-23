import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import {
    StartNativeGoogleLoginRequestDto,
    ExchangeNativeLoginRequestDto,
} from '../dto/request/native-login-request.dto';
import {
    StartNativeGoogleLoginResponseDto,
    ExchangeNativeLoginResponseDto,
} from '../dto/response/native-login-response.dto';

/** 네이티브 인증 시작의 HTTP 계약을 문서화한다. */
export function ApiStartNativeGoogleLoginEndpoint() {
    return applyDecorators(
        ApiBody({ type: StartNativeGoogleLoginRequestDto }),
        ApiEndpoint({
            summary: '앱 Google 로그인 시작',
            isPublic: true,
            responseType: StartNativeGoogleLoginResponseDto,
            errorResponses: [
                { status: 429, description: 'IP당 10분 내 인증 시작 30회 초과' },
                { status: 503, description: '인증 공유 저장소를 사용할 수 없음' },
            ],
        }),
    );
}

/** 인증 결과는 PKCE로 묶인 일회용 코드로만 교환한다. */
export function ApiExchangeNativeLoginEndpoint() {
    return applyDecorators(
        ApiBody({ type: ExchangeNativeLoginRequestDto }),
        ApiEndpoint({
            summary: '앱 로그인 결과 교환',
            isPublic: true,
            responseType: ExchangeNativeLoginResponseDto,
            errorResponses: [
                { status: 401, description: '인증 만료, 재사용 또는 PKCE 불일치' },
                { status: 503, description: '인증 공유 저장소를 사용할 수 없음' },
            ],
        }),
    );
}
