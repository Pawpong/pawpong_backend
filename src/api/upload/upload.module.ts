import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadController } from './upload.controller';
import { UploadAdminController } from './admin/upload-admin.controller';

import { UploadAdminService } from './admin/upload-admin.service';
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
        UploadController,
        UploadAdminController, // 컨트롤러 제외하고 서비스만 테스트
    ],
    providers: [
        UploadRepresentativePhotosUseCase,
        UploadAvailablePetPhotosUseCase,
        UploadParentPetPhotosUseCase,
        UploadSingleFileUseCase,
        UploadMultipleFilesUseCase,
        DeleteUploadedFileUseCase,
        UploadFilePolicyService,
        UploadStoredFilePathService,
        UploadPhotoCollectionService,
        UploadStorageAdapter,
        UploadMongooseOwnerAdapter,
        UploadAdminService, // 서비스만 추가
        {
            provide: UPLOAD_FILE_STORE,
            useExisting: UploadStorageAdapter,
        },
        {
            provide: UPLOAD_OWNER_PORT,
            useExisting: UploadMongooseOwnerAdapter,
        },
    ],
})
export class UploadModule {}
