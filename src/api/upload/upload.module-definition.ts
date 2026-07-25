import { UploadFilesModule } from './files/upload-files.module';
import { UploadAdminModule } from './admin/upload-admin.module';

// 업로드 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
export const UPLOAD_MODULE_IMPORTS = [UploadFilesModule, UploadAdminModule];
