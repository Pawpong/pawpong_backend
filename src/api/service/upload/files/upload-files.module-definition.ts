import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';
import { ParentPet, ParentPetSchema } from '../../../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../../../schema/available-pet.schema';

import { UploadRepresentativePhotoController } from '../controller/upload-representative-photo.controller';
import { UploadAvailablePetPhotoController } from '../controller/upload-available-pet-photo.controller';
import { UploadParentPetPhotoController } from '../controller/upload-parent-pet-photo.controller';
import { UploadSingleFileController } from '../controller/upload-single-file.controller';
import { UploadMultipleFilesController } from '../controller/upload-multiple-files.controller';
import { UploadFileDeleteController } from '../controller/upload-file-delete.controller';
import { UploadRepresentativePhotosUseCase } from '../application/use-cases/upload-representative-photos.use-case';
import { UploadAvailablePetPhotosUseCase } from '../application/use-cases/upload-available-pet-photos.use-case';
import { UploadParentPetPhotosUseCase } from '../application/use-cases/upload-parent-pet-photos.use-case';
import { UploadSingleFileUseCase } from '../application/use-cases/upload-single-file.use-case';
import { UploadMultipleFilesUseCase } from '../application/use-cases/upload-multiple-files.use-case';
import { DeleteUploadedFileUseCase } from '../application/use-cases/delete-uploaded-file.use-case';
import { UploadResultMapperService } from '../domain/services/upload-result-mapper.service';
import { UploadFilePolicyService } from '../domain/services/upload-file-policy.service';
import { UploadStoredFilePathService } from '../domain/services/upload-stored-file-path.service';
import { UploadPhotoCollectionService } from '../domain/services/upload-photo-collection.service';
import { UploadOwnerRepository } from '../repository/upload-owner.repository';
import { UploadStorageAdapter } from '../infrastructure/upload-storage.adapter';
import { UploadMongooseOwnerAdapter } from '../infrastructure/upload-mongoose-owner.adapter';
import { UPLOAD_FILE_STORE_PORT } from '../application/ports/upload-file-store.port';
import { UPLOAD_OWNER_PORT } from '../application/ports/upload-owner.port';

// 업로드 > 사용자 파일 슬라이스
// 대표사진/부모견/분양견 사진은 소유자(브리더·펫) 도큐먼트에 파일키를 반영해야 하므로
// 해당 스키마와 OWNER Port 가 필요하다.
const UPLOAD_FILES_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
]);

export const UPLOAD_FILES_MODULE_IMPORTS = [UPLOAD_FILES_SCHEMA_IMPORTS, StorageModule];

export const UPLOAD_FILES_MODULE_CONTROLLERS = [
    UploadRepresentativePhotoController,
    UploadAvailablePetPhotoController,
    UploadParentPetPhotoController,
    UploadSingleFileController,
    UploadMultipleFilesController,
    UploadFileDeleteController,
];

export const UPLOAD_FILES_MODULE_PROVIDERS = [
    UploadRepresentativePhotosUseCase,
    UploadAvailablePetPhotosUseCase,
    UploadParentPetPhotosUseCase,
    UploadSingleFileUseCase,
    UploadMultipleFilesUseCase,
    DeleteUploadedFileUseCase,
    UploadResultMapperService,
    UploadFilePolicyService,
    UploadStoredFilePathService,
    UploadPhotoCollectionService,
    UploadOwnerRepository,
    UploadStorageAdapter,
    UploadMongooseOwnerAdapter,
    { provide: UPLOAD_FILE_STORE_PORT, useExisting: UploadStorageAdapter },
    { provide: UPLOAD_OWNER_PORT, useExisting: UploadMongooseOwnerAdapter },
];

export const UPLOAD_FILES_MODULE_EXPORTS = [UPLOAD_FILE_STORE_PORT];
