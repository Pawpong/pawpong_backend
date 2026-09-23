import { ApiProperty } from '@nestjs/swagger';

export class StartNativeGoogleLoginResponseDto {
    @ApiProperty({ description: '시스템 인증 브라우저에서 열 Google OAuth 주소' })
    authorizationUrl: string;

    @ApiProperty({ description: '복귀 시 앱이 대조할 opaque state (유효시간 10분)' })
    state: string;
}

export class ExchangeNativeLoginResponseDto {
    @ApiProperty({ description: '앱 WebView에서만 열 로그인/가입/계정 복구 결과 주소' })
    redirectUrl: string;
}
