import { Module } from '@nestjs/common';
import { UPLOAD_MODULE_IMPORTS } from './upload.module-definition';

/**
 * 업로드 바운디드 컨텍스트
 * - 하위 기능 슬라이스(files/admin) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: UPLOAD_MODULE_IMPORTS,
})
export class UploadModule {}
