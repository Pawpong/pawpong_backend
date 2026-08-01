import { Module } from '@nestjs/common';

import {
    UPLOAD_ADMIN_MODULE_CONTROLLERS,
    UPLOAD_ADMIN_MODULE_IMPORTS,
    UPLOAD_ADMIN_MODULE_PROVIDERS,
} from './upload-admin.module-definition';

/**
 * 업로드 > 관리자 스토리지 관리 슬라이스
 * - 전체/폴더별 파일 목록 조회
 * - 파일·다중 파일·폴더 삭제
 * - 파일 참조 여부 확인(고아 파일 정리용)
 */
@Module({
    imports: UPLOAD_ADMIN_MODULE_IMPORTS,
    controllers: UPLOAD_ADMIN_MODULE_CONTROLLERS,
    providers: UPLOAD_ADMIN_MODULE_PROVIDERS,
})
export class UploadAdminModule {}
