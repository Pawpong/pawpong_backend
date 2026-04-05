import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadFilePolicyService {
    private readonly allowedImageMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heif',
        'image/heic',
    ];

    private readonly allowedVideoMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    private readonly imageMaxSize = 100 * 1024 * 1024;
    private readonly videoMaxSize = 100 * 1024 * 1024;

    ensureRepresentativePhotos(files: Express.Multer.File[]): void {
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        if (files.length > 3) {
            throw new BadRequestException('대표 사진은 최대 3장까지 업로드 가능합니다.');
        }

        files.forEach((file) => this.validateMediaFile(file));
    }

    ensurePublicSingleFile(file?: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('파일이 없습니다.');
        }
    }

    ensurePublicMultipleFiles(files: Express.Multer.File[]): void {
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 없습니다.');
        }
    }

    ensurePetPhotoLimit(existingPhotoCount: number, newFileCount: number): void {
        const totalCount = existingPhotoCount + newFileCount;
        if (totalCount > 5) {
            throw new BadRequestException(`사진은 최대 5장까지 업로드 가능합니다. (현재: ${totalCount}장)`);
        }
    }

    validatePetPhotoFiles(files: Express.Multer.File[], existingPhotoCount: number): void {
        files.forEach((file, index) => {
            if (existingPhotoCount === 0 && index === 0) {
                this.validateImageFile(file);
                return;
            }

            this.validateMediaFile(file);
        });
    }

    private validateMediaFile(file: Express.Multer.File): void {
        const isVideo = this.allowedVideoMimeTypes.includes(file.mimetype);
        const isImage = this.allowedImageMimeTypes.includes(file.mimetype);

        if (!isVideo && !isImage) {
            throw new BadRequestException(
                '이미지 또는 영상 파일만 업로드 가능합니다. (jpg, jpeg, png, gif, webp, heif, heic, mp4, mov, avi, webm)',
            );
        }

        if (isVideo && file.size > this.videoMaxSize) {
            throw new BadRequestException('영상 파일 크기는 100MB를 초과할 수 없습니다.');
        }

        if (isImage && file.size > this.imageMaxSize) {
            throw new BadRequestException('이미지 파일 크기는 100MB를 초과할 수 없습니다.');
        }
    }

    private validateImageFile(file: Express.Multer.File): void {
        const isImage = this.allowedImageMimeTypes.includes(file.mimetype);

        if (!isImage) {
            throw new BadRequestException(
                '이미지 파일만 업로드 가능합니다. 동영상은 업로드할 수 없습니다. (jpg, jpeg, png, gif, webp, heif, heic)',
            );
        }

        if (file.size > this.imageMaxSize) {
            throw new BadRequestException('이미지 파일 크기는 100MB를 초과할 수 없습니다.');
        }
    }
}
