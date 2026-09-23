import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
    NATIVE_AUTH_CODE_PATTERN,
    NATIVE_AUTH_VERIFIER_PATTERN,
    NATIVE_GOOGLE_STATE_PATTERN,
} from '../../domain/services/auth-native-login-policy.service';

export class StartNativeGoogleLoginRequestDto {
    @ApiProperty({ description: '앱이 생성한 PKCE verifier의 S256 base64url challenge', minLength: 43, maxLength: 43 })
    @IsString()
    @Matches(NATIVE_AUTH_CODE_PATTERN)
    codeChallenge: string;

    @ApiProperty({ description: '로그인 쿠키를 생성할 앱 WebView 출처', example: 'https://pawpong.kr' })
    @IsString()
    @MaxLength(100)
    frontendOrigin: string;

    @ApiPropertyOptional({ description: '로그인 완료 후 내부 이동 경로', example: '/explore' })
    @IsOptional()
    @IsString()
    @MaxLength(2048)
    returnUrl?: string;
}

export class ExchangeNativeLoginRequestDto {
    @ApiProperty({ description: '고정 앱 콜백이 반환한 일회용 코드', minLength: 43, maxLength: 43 })
    @IsString()
    @Matches(NATIVE_AUTH_CODE_PATTERN)
    code: string;

    @ApiProperty({ description: '인증 시작 응답과 동일한 opaque state' })
    @IsString()
    @Matches(NATIVE_GOOGLE_STATE_PATTERN)
    state: string;

    @ApiProperty({ description: '인증 시작 시 앱이 생성해 보관한 PKCE verifier', minLength: 43, maxLength: 128 })
    @IsString()
    @Matches(NATIVE_AUTH_VERIFIER_PATTERN)
    codeVerifier: string;
}
