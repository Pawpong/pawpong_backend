import { Module } from '@nestjs/common';

import {
    UPLOAD_FILES_MODULE_CONTROLLERS,
    UPLOAD_FILES_MODULE_EXPORTS,
    UPLOAD_FILES_MODULE_IMPORTS,
    UPLOAD_FILES_MODULE_PROVIDERS,
} from './upload-files.module-definition';

/**
 * 업로드 > 사용자 파일 슬라이스
 * - 단일/다중 파일 업로드, 파일 삭제
 * - 대표사진·부모견·분양견 사진 업로드(소유자 도큐먼트 반영)
 */
@Module({
    imports: UPLOAD_FILES_MODULE_IMPORTS,
    controllers: UPLOAD_FILES_MODULE_CONTROLLERS,
    providers: UPLOAD_FILES_MODULE_PROVIDERS,
    exports: UPLOAD_FILES_MODULE_EXPORTS,
})
export class UploadFilesModule {}
