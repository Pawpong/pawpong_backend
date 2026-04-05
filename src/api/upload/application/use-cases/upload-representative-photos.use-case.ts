import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { UploadResponseDto } from '../../dto/response/upload-response.dto';
import { UPLOAD_FILE_STORE } from '../ports/upload-file-store.port';
import { UPLOAD_OWNER_PORT } from '../ports/upload-owner.port';
import type { UploadFileStorePort } from '../ports/upload-file-store.port';
import type { UploadOwnerPort } from '../ports/upload-owner.port';
import { UploadResponseMapper } from '../mappers/upload-response.mapper';
import { UploadFilePolicyService } from '../../domain/services/upload-file-policy.service';

@Injectable()
export class UploadRepresentativePhotosUseCase {
    constructor(
        @Inject(UPLOAD_FILE_STORE) private readonly fileStore: UploadFileStorePort,
        @Inject(UPLOAD_OWNER_PORT) private readonly uploadOwner: UploadOwnerPort,
        private readonly uploadFilePolicy: UploadFilePolicyService,
    ) {}

    async execute(files: Express.Multer.File[], user: any): Promise<UploadResponseDto[]> {
        if (user.role !== 'breeder') {
            throw new ForbiddenException('브리더만 대표 사진을 업로드할 수 있습니다.');
        }

        this.uploadFilePolicy.ensureRepresentativePhotos(files);

        const resources = await this.fileStore.uploadFiles(files, 'representative');
        await this.uploadOwner.replaceRepresentativePhotos(
            user.userId,
            resources.map((resource) => resource.fileName),
        );

        return UploadResponseMapper.toDtos(resources, files);
    }
}
