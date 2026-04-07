import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { UploadResponseDto } from '../../dto/response/upload-response.dto';
import { UPLOAD_FILE_STORE } from '../ports/upload-file-store.port';
import { UPLOAD_OWNER_PORT } from '../ports/upload-owner.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';
import type { UploadOwnerPort } from '../ports/upload-owner.port';
import { UploadResponseMapper } from '../mappers/upload-response.mapper';
import { UploadFilePolicyService } from '../../domain/services/upload-file-policy.service';
import { UploadStoredFilePathService } from '../../domain/services/upload-stored-file-path.service';
import { UploadPhotoCollectionService } from '../../domain/services/upload-photo-collection.service';

@Injectable()
export class UploadParentPetPhotosUseCase {
    constructor(
        @Inject(UPLOAD_FILE_STORE) private readonly fileStore: UploadFileStorePort,
        @Inject(UPLOAD_OWNER_PORT) private readonly uploadOwner: UploadOwnerPort,
        private readonly uploadFilePolicy: UploadFilePolicyService,
        private readonly uploadStoredFilePathService: UploadStoredFilePathService,
        private readonly uploadPhotoCollectionService: UploadPhotoCollectionService,
    ) {}

    async execute(
        petId: string,
        files: Express.Multer.File[],
        existingPhotos: string[],
        userId: string,
        role: string,
    ): Promise<UploadResponseDto[]> {
        if (role !== 'breeder') {
            throw new ForbiddenException('브리더만 부모견/묘 사진을 업로드할 수 있습니다.');
        }

        const pet = await this.uploadOwner.findOwnedParentPet(petId, userId);
        if (!pet) {
            throw new BadRequestException('해당 부모견/묘를 찾을 수 없습니다.');
        }

        const requestedPhotoPaths = this.uploadStoredFilePathService.extractStoredPaths(
            existingPhotos,
            this.fileStore.getBucketName(),
        );
        const existingPhotoPaths = this.uploadPhotoCollectionService.resolveExistingPhotoPaths(
            requestedPhotoPaths,
            pet.photoPaths,
        );

        this.uploadFilePolicy.ensurePetPhotoLimit(existingPhotoPaths.length, files?.length || 0);

        let uploadedResources: Awaited<ReturnType<UploadFileStorePort['uploadFiles']>> = [];
        if (files && files.length > 0) {
            this.uploadFilePolicy.validatePetPhotoFiles(files, existingPhotoPaths.length);
            uploadedResources = await this.fileStore.uploadFiles(files, 'pets/parent');
        }

        const allPhotoPaths = this.uploadPhotoCollectionService.mergePhotoPaths(
            existingPhotoPaths,
            uploadedResources.map((resource) => resource.fileName),
        );

        await this.uploadOwner.replaceParentPetPhotos(petId, userId, allPhotoPaths);

        return UploadResponseMapper.toDtos(uploadedResources, files || []);
    }
}
