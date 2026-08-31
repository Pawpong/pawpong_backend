import { StorageModule } from '../../../../common/storage/storage.module';

import { AuthSharedModule } from '../shared/auth-shared.module';
import { AuthProfileUploadController } from '../controller/auth-profile-upload.controller';
import { AuthBreederDocumentsUploadController } from '../controller/auth-breeder-documents-upload.controller';
import { UploadAuthProfileImageUseCase } from '../application/use-cases/upload-auth-profile-image.use-case';
import { UploadAuthBreederDocumentsUseCase } from '../application/use-cases/upload-auth-breeder-documents.use-case';
import { AuthProfileImageFilePolicyService } from '../domain/services/auth-profile-image-file-policy.service';
import { AuthBreederDocumentFilePolicyService } from '../domain/services/auth-breeder-document-file-policy.service';
import { AuthBreederDocumentOriginalFileNameService } from '../domain/services/auth-breeder-document-original-file-name.service';
import { AuthUploadFileStoreAdapter } from '../infrastructure/auth-upload-file-store.adapter';
import { AuthProfileImageTargetAdapter } from '../infrastructure/auth-profile-image-target.adapter';
import { AUTH_UPLOAD_FILE_STORE_PORT } from '../application/ports/auth-upload-file-store.port';
import { AUTH_PROFILE_IMAGE_TARGET_PORT } from '../application/ports/auth-profile-image-target.port';

// 인증 > 가입 단계 업로드 슬라이스 (프로필 이미지, 브리더 인증 서류)
// 가입 완료 전 임시 저장(AUTH_TEMP_UPLOAD_PORT)은 shared 에서 주입받는다.
export const AUTH_UPLOAD_MODULE_IMPORTS = [AuthSharedModule, StorageModule];

export const AUTH_UPLOAD_MODULE_CONTROLLERS = [AuthProfileUploadController, AuthBreederDocumentsUploadController];

export const AUTH_UPLOAD_MODULE_PROVIDERS = [
    UploadAuthProfileImageUseCase,
    UploadAuthBreederDocumentsUseCase,
    AuthProfileImageFilePolicyService,
    AuthBreederDocumentFilePolicyService,
    AuthBreederDocumentOriginalFileNameService,
    AuthUploadFileStoreAdapter,
    AuthProfileImageTargetAdapter,
    {
        provide: AUTH_UPLOAD_FILE_STORE_PORT,
        useExisting: AuthUploadFileStoreAdapter,
    },
    {
        provide: AUTH_PROFILE_IMAGE_TARGET_PORT,
        useExisting: AuthProfileImageTargetAdapter,
    },
];
