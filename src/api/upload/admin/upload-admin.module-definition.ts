import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { ParentPet, ParentPetSchema } from '../../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../../schema/available-pet.schema';
import { Banner, BannerSchema } from '../../../schema/banner.schema';
import { AuthBanner, AuthBannerSchema } from '../../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerSchema } from '../../../schema/counsel-banner.schema';
import { AiImageFilter, AiImageFilterSchema } from '../../../schema/ai-image-filter.schema';
import { AiImageJob, AiImageJobSchema } from '../../../schema/ai-image-job.schema';
import { ContestEntry, ContestEntrySchema } from '../../../schema/contest-entry.schema';

import { UploadAdminFilesListController } from './controller/upload-admin-files-list.controller';
import { UploadAdminFolderFilesController } from './controller/upload-admin-folder-files.controller';
import { UploadAdminFileDeleteController } from './controller/upload-admin-file-delete.controller';
import { UploadAdminFilesDeleteController } from './controller/upload-admin-files-delete.controller';
import { UploadAdminFolderDeleteController } from './controller/upload-admin-folder-delete.controller';
import { UploadAdminCheckFileReferencesController } from './controller/upload-admin-check-file-references.controller';
import { UploadAdminReferencedFilesController } from './controller/upload-admin-referenced-files.controller';
import { ListAllFilesUseCase } from './application/use-cases/list-all-files.use-case';
import { ListFilesByFolderUseCase } from './application/use-cases/list-files-by-folder.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { DeleteMultipleFilesUseCase } from './application/use-cases/delete-multiple-files.use-case';
import { DeleteFolderUseCase } from './application/use-cases/delete-folder.use-case';
import { CheckFileReferencesUseCase } from './application/use-cases/check-file-references.use-case';
import { GetAllReferencedFilesUseCase } from './application/use-cases/get-all-referenced-files.use-case';
import { UploadAdminStoragePolicyService } from './domain/services/upload-admin-storage-policy.service';
import { UploadAdminStorageListAssemblerService } from './domain/services/upload-admin-storage-list-assembler.service';
import { UploadAdminFileReferenceRepository } from './repository/upload-admin-file-reference.repository';
import { UploadAdminStorageAdapter } from './infrastructure/upload-admin-storage.adapter';
import { UploadAdminFileReferenceReaderAdapter } from './infrastructure/upload-admin-file-reference-reader.adapter';
import { UPLOAD_ADMIN_STORAGE_PORT } from './application/ports/upload-admin-storage.port';
import { UPLOAD_ADMIN_REFERENCE_READER_PORT } from './application/ports/upload-admin-reference-reader.port';
import {
    DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND,
    LIST_ALL_UPLOAD_ADMIN_FILES_QUERY,
} from './application/tokens/upload-admin-file-orchestration.token';

// 업로드 > 관리자 스토리지 관리 슬라이스
// 미참조(고아) 파일 판별을 위해 파일키를 참조하는 모든 도큐먼트 스키마가 필요하다.
const UPLOAD_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: Banner.name, schema: BannerSchema },
    { name: AuthBanner.name, schema: AuthBannerSchema },
    { name: CounselBanner.name, schema: CounselBannerSchema },
    // 고아 파일 오분류 방지 — 아래 컬렉션이 참조하는 키도 판정 대상에 포함해야 한다
    { name: AiImageFilter.name, schema: AiImageFilterSchema },
    { name: AiImageJob.name, schema: AiImageJobSchema },
    { name: ContestEntry.name, schema: ContestEntrySchema },
]);

export const UPLOAD_ADMIN_MODULE_IMPORTS = [UPLOAD_ADMIN_SCHEMA_IMPORTS, StorageModule];

export const UPLOAD_ADMIN_MODULE_CONTROLLERS = [
    UploadAdminFilesListController,
    UploadAdminFolderFilesController,
    UploadAdminFileDeleteController,
    UploadAdminFilesDeleteController,
    UploadAdminFolderDeleteController,
    UploadAdminCheckFileReferencesController,
    UploadAdminReferencedFilesController,
];

export const UPLOAD_ADMIN_MODULE_PROVIDERS = [
    ListAllFilesUseCase,
    ListFilesByFolderUseCase,
    DeleteFileUseCase,
    DeleteMultipleFilesUseCase,
    DeleteFolderUseCase,
    CheckFileReferencesUseCase,
    GetAllReferencedFilesUseCase,
    UploadAdminStoragePolicyService,
    UploadAdminStorageListAssemblerService,
    UploadAdminFileReferenceRepository,
    UploadAdminStorageAdapter,
    UploadAdminFileReferenceReaderAdapter,
    { provide: UPLOAD_ADMIN_STORAGE_PORT, useExisting: UploadAdminStorageAdapter },
    { provide: UPLOAD_ADMIN_REFERENCE_READER_PORT, useExisting: UploadAdminFileReferenceReaderAdapter },
    { provide: LIST_ALL_UPLOAD_ADMIN_FILES_QUERY, useExisting: ListAllFilesUseCase },
    { provide: DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND, useExisting: DeleteMultipleFilesUseCase },
];
