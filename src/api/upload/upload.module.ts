import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadAdminFileCommandController } from './admin/upload-admin-file-command.controller';
import { UploadAdminFileQueryController } from './admin/upload-admin-file-query.controller';
import { UploadAdminReferenceController } from './admin/upload-admin-reference.controller';
import { UploadFileController } from './upload-file.controller';
import { UploadAvailablePetPhotoController } from './upload-available-pet-photo.controller';
import { UploadParentPetPhotoController } from './upload-parent-pet-photo.controller';
import { UploadRepresentativePhotoController } from './upload-representative-photo.controller';
import { UPLOAD_ADMIN_STORAGE } from './admin/application/ports/upload-admin-storage.port';
import { UPLOAD_ADMIN_REFERENCE_READER } from './admin/application/ports/upload-admin-reference-reader.port';
import { ListAllFilesUseCase } from './admin/application/use-cases/list-all-files.use-case';
import { ListFilesByFolderUseCase } from './admin/application/use-cases/list-files-by-folder.use-case';
import { DeleteFileUseCase } from './admin/application/use-cases/delete-file.use-case';
import { DeleteMultipleFilesUseCase } from './admin/application/use-cases/delete-multiple-files.use-case';
import { DeleteFolderUseCase } from './admin/application/use-cases/delete-folder.use-case';
import { CheckFileReferencesUseCase } from './admin/application/use-cases/check-file-references.use-case';
import { GetAllReferencedFilesUseCase } from './admin/application/use-cases/get-all-referenced-files.use-case';
import { UploadAdminStoragePolicyService } from './admin/domain/services/upload-admin-storage-policy.service';
import { UploadAdminStoragePresentationService } from './admin/domain/services/upload-admin-storage-presentation.service';
import { UploadAdminStorageAdapter } from './admin/infrastructure/upload-admin-storage.adapter';
import { UploadAdminFileReferenceReaderAdapter } from './admin/infrastructure/upload-admin-file-reference-reader.adapter';
import { UPLOAD_FILE_STORE } from './application/ports/upload-file-store.port';
import { UPLOAD_OWNER_PORT } from './application/ports/upload-owner.port';
import { UploadRepresentativePhotosUseCase } from './application/use-cases/upload-representative-photos.use-case';
import { UploadAvailablePetPhotosUseCase } from './application/use-cases/upload-available-pet-photos.use-case';
import { UploadParentPetPhotosUseCase } from './application/use-cases/upload-parent-pet-photos.use-case';
import { UploadSingleFileUseCase } from './application/use-cases/upload-single-file.use-case';
import { UploadMultipleFilesUseCase } from './application/use-cases/upload-multiple-files.use-case';
import { DeleteUploadedFileUseCase } from './application/use-cases/delete-uploaded-file.use-case';
import { UploadFilePolicyService } from './domain/services/upload-file-policy.service';
import { UploadStoredFilePathService } from './domain/services/upload-stored-file-path.service';
import { UploadPhotoCollectionService } from './domain/services/upload-photo-collection.service';
import { UploadStorageAdapter } from './infrastructure/upload-storage.adapter';
import { UploadMongooseOwnerAdapter } from './infrastructure/upload-mongoose-owner.adapter';

import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Banner, BannerSchema } from '../../schema/banner.schema';
import { AuthBanner, AuthBannerSchema } from '../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerSchema } from '../../schema/counsel-banner.schema';

import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: Banner.name, schema: BannerSchema },
            { name: AuthBanner.name, schema: AuthBannerSchema },
            { name: CounselBanner.name, schema: CounselBannerSchema },
        ]),
        StorageModule,
    ],
    controllers: [
        UploadRepresentativePhotoController,
        UploadAvailablePetPhotoController,
        UploadParentPetPhotoController,
        UploadFileController,
        UploadAdminFileQueryController,
        UploadAdminFileCommandController,
        UploadAdminReferenceController,
    ],
    providers: [
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
        UploadFilePolicyService,
        UploadStoredFilePathService,
        UploadPhotoCollectionService,
        UploadAdminStoragePolicyService,
        UploadAdminStoragePresentationService,
        UploadStorageAdapter,
        UploadMongooseOwnerAdapter,
        UploadAdminStorageAdapter,
        UploadAdminFileReferenceReaderAdapter,
        {
            provide: UPLOAD_FILE_STORE,
            useExisting: UploadStorageAdapter,
        },
        {
            provide: UPLOAD_OWNER_PORT,
            useExisting: UploadMongooseOwnerAdapter,
        },
        {
            provide: UPLOAD_ADMIN_STORAGE,
            useExisting: UploadAdminStorageAdapter,
        },
        {
            provide: UPLOAD_ADMIN_REFERENCE_READER,
            useExisting: UploadAdminFileReferenceReaderAdapter,
        },
    ],
})
export class UploadModule {}
