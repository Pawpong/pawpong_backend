import { Module } from '@nestjs/common';

import {
    AUTH_UPLOAD_MODULE_CONTROLLERS,
    AUTH_UPLOAD_MODULE_IMPORTS,
    AUTH_UPLOAD_MODULE_PROVIDERS,
} from './auth-upload.module-definition';

/**
 * 인증 > 가입 단계 업로드 슬라이스
 * - 프로필 이미지 업로드
 * - 브리더 인증 서류 업로드 및 제출
 */
@Module({
    imports: AUTH_UPLOAD_MODULE_IMPORTS,
    controllers: AUTH_UPLOAD_MODULE_CONTROLLERS,
    providers: AUTH_UPLOAD_MODULE_PROVIDERS,
})
export class AuthUploadModule {}
