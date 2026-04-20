import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { AuthBanner, AuthBannerSchema } from '../../schema/auth-banner.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Banner, BannerSchema } from '../../schema/banner.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { CounselBanner, CounselBannerSchema } from '../../schema/counsel-banner.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { StorageModule } from '../../common/storage/storage.module';

import { UploadAdminCheckFileReferencesController } from './admin/upload-admin-check-file-references.controller';
import { UploadAdminFileDeleteController } from './admin/upload-admin-file-delete.controller';
import { UploadAdminFilesDeleteController } from './admin/upload-admin-files-delete.controller';
import { UploadAdminFilesListController } from './admin/upload-admin-files-list.controller';
import { UploadAdminFolderDeleteController } from './admin/upload-admin-folder-delete.controller';
import { UploadAdminFolderFilesController } from './admin/upload-admin-folder-files.controller';
import { UploadAdminReferencedFilesController } from './admin/upload-admin-referenced-files.controller';
import { UPLOAD_ADMIN_REFERENCE_READER_PORT } from './admin/application/ports/upload-admin-reference-reader.port';
import { UPLOAD_ADMIN_STORAGE_PORT } from './admin/application/ports/upload-admin-storage.port';
import {
    DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND,
    LIST_ALL_UPLOAD_ADMIN_FILES_QUERY,
} from './admin/application/tokens/upload-admin-file-orchestration.token';
import { CheckFileReferencesUseCase } from './admin/application/use-cases/check-file-references.use-case';
import { DeleteFileUseCase } from './admin/application/use-cases/delete-file.use-case';
import { DeleteFolderUseCase } from './admin/application/use-cases/delete-folder.use-case';
import { DeleteMultipleFilesUseCase } from './admin/application/use-cases/delete-multiple-files.use-case';
import { GetAllReferencedFilesUseCase } from './admin/application/use-cases/get-all-referenced-files.use-case';
import { ListAllFilesUseCase } from './admin/application/use-cases/list-all-files.use-case';
import { ListFilesByFolderUseCase } from './admin/application/use-cases/list-files-by-folder.use-case';
import { UploadAdminStorageListAssemblerService } from './admin/domain/services/upload-admin-storage-list-assembler.service';
import { UploadAdminStoragePolicyService } from './admin/domain/services/upload-admin-storage-policy.service';
import { UploadAdminFileReferenceReaderAdapter } from './admin/infrastructure/upload-admin-file-reference-reader.adapter';
import { UploadAdminStorageAdapter } from './admin/infrastructure/upload-admin-storage.adapter';
import { UploadAdminFileReferenceRepository } from './admin/repository/upload-admin-file-reference.repository';
import { UPLOAD_FILE_STORE_PORT } from './application/ports/upload-file-store.port';
import { UPLOAD_OWNER_PORT } from './application/ports/upload-owner.port';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';
import { UploadAvailablePetPhotosUseCase } from './application/use-cases/upload-available-pet-photos.use-case';
import { UploadMultipleFilesUseCase } from './application/use-cases/upload-multiple-files.use-case';
import { UploadParentPetPhotosUseCase } from './application/use-cases/upload-parent-pet-photos.use-case';
import { UploadRepresentativePhotosUseCase } from './application/use-cases/upload-representative-photos.use-case';
import { UploadSingleFileUseCase } from './application/use-cases/upload-single-file.use-case';
import { UploadFilePolicyService } from './domain/services/upload-file-policy.service';
import { UploadPhotoCollectionService } from './domain/services/upload-photo-collection.service';
import { UploadResultMapperService } from './domain/services/upload-result-mapper.service';
import { UploadStoredFilePathService } from './domain/services/upload-stored-file-path.service';
import { UploadMongooseOwnerAdapter } from './infrastructure/upload-mongoose-owner.adapter';
import { UploadStorageAdapter } from './infrastructure/upload-storage.adapter';
import { UploadOwnerRepository } from './repository/upload-owner.repository';
import { UploadAvailablePetPhotoController } from './upload-available-pet-photo.controller';
import { UploadFileDeleteController } from './upload-file-delete.controller';
import { UploadMultipleFilesController } from './upload-multiple-files.controller';
import { UploadParentPetPhotoController } from './upload-parent-pet-photo.controller';
import { UploadRepresentativePhotoController } from './upload-representative-photo.controller';
import { UploadSingleFileController } from './upload-single-file.controller';

const UPLOAD_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Banner.name, schema: BannerSchema },
    { name: AuthBanner.name, schema: AuthBannerSchema },
    { name: CounselBanner.name, schema: CounselBannerSchema },
]);

export const UPLOAD_MODULE_IMPORTS = [UPLOAD_SCHEMA_IMPORTS, StorageModule];

export const UPLOAD_MODULE_CONTROLLERS = [
    UploadRepresentativePhotoController,
    UploadAvailablePetPhotoController,
    UploadParentPetPhotoController,
    UploadSingleFileController,
    UploadMultipleFilesController,
    UploadFileDeleteController,
    UploadAdminFilesListController,
    UploadAdminFolderFilesController,
    UploadAdminFileDeleteController,
    UploadAdminFilesDeleteController,
    UploadAdminFolderDeleteController,
    UploadAdminCheckFileReferencesController,
    UploadAdminReferencedFilesController,
];

const UPLOAD_USE_CASE_PROVIDERS = [
    UploadRepresentativePhotosUseCase,
    UploadAvailablePetPhotosUseCase,
    UploadParentPetPhotosUseCase,
    UploadSingleFileUseCase,
    UploadMultipleFilesUseCase,
    DeleteUploadedFileUseCase,
    ListAllFilesUseCase,
    ListFilesByFolderUseCase,
    DeleteFileUseCase,
    DeleteMultipleFilesUseCase,
    DeleteFolderUseCase,
    CheckFileReferencesUseCase,
    GetAllReferencedFilesUseCase,
];

const UPLOAD_DOMAIN_PROVIDERS = [
    UploadResultMapperService,
    UploadFilePolicyService,
    UploadStoredFilePathService,
    UploadPhotoCollectionService,
    UploadAdminStoragePolicyService,
    UploadAdminStorageListAssemblerService,
];

const UPLOAD_INFRASTRUCTURE_PROVIDERS = [
    UploadOwnerRepository,
    UploadAdminFileReferenceRepository,
    UploadStorageAdapter,
    UploadMongooseOwnerAdapter,
    UploadAdminStorageAdapter,
    UploadAdminFileReferenceReaderAdapter,
];

const UPLOAD_PORT_BINDINGS = [
    {
        provide: UPLOAD_FILE_STORE_PORT,
        useExisting: UploadStorageAdapter,
    },
    {
        provide: UPLOAD_OWNER_PORT,
        useExisting: UploadMongooseOwnerAdapter,
    },
    {
        provide: UPLOAD_ADMIN_STORAGE_PORT,
        useExisting: UploadAdminStorageAdapter,
    },
    {
        provide: UPLOAD_ADMIN_REFERENCE_READER_PORT,
        useExisting: UploadAdminFileReferenceReaderAdapter,
    },
    {
        provide: LIST_ALL_UPLOAD_ADMIN_FILES_QUERY,
        useExisting: ListAllFilesUseCase,
    },
    {
        provide: DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND,
        useExisting: DeleteMultipleFilesUseCase,
    },
];

export const UPLOAD_MODULE_PROVIDERS = [
    ...UPLOAD_USE_CASE_PROVIDERS,
    ...UPLOAD_DOMAIN_PROVIDERS,
    ...UPLOAD_INFRASTRUCTURE_PROVIDERS,
    ...UPLOAD_PORT_BINDINGS,
];
