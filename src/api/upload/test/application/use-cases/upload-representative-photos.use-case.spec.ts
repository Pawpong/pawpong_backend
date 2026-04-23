import { DomainAuthorizationError } from '../../../../../common/error/domain.error';
import type { UploadFileStorePort } from '../../../application/ports/upload-file-store.port';
import type { UploadOwnerPort } from '../../../application/ports/upload-owner.port';
import { UploadRepresentativePhotosUseCase } from '../../../application/use-cases/upload-representative-photos.use-case';
import { UploadFilePolicyService } from '../../../domain/services/upload-file-policy.service';
import { UploadResultMapperService } from '../../../domain/services/upload-result-mapper.service';

const createImageFile = (originalname: string, size: number = 1024): Express.Multer.File =>
    ({
        originalname,
        mimetype: 'image/jpeg',
        size,
    }) as Express.Multer.File;

describe('대표 사진 업로드 유스케이스', () => {
    const createUseCase = () => {
        const fileStore: UploadFileStorePort = {
            uploadFile: jest.fn(),
            uploadFiles: jest.fn().mockResolvedValue([
                {
                    fileName: 'representative/photo-1.jpg',
                    cdnUrl: 'https://cdn.test/representative/photo-1.jpg',
                    storageUrl: 'https://storage.test/representative/photo-1.jpg',
                },
            ]),
            deleteFile: jest.fn(),
            getBucketName: jest.fn(),
        };
        const uploadOwner: UploadOwnerPort = {
            replaceRepresentativePhotos: jest.fn().mockResolvedValue(undefined),
            findOwnedAvailablePet: jest.fn(),
            replaceAvailablePetPhotos: jest.fn(),
            findOwnedParentPet: jest.fn(),
            replaceParentPetPhotos: jest.fn(),
        };
        const useCase = new UploadRepresentativePhotosUseCase(
            fileStore,
            uploadOwner,
            new UploadFilePolicyService(),
            new UploadResultMapperService(),
        );

        return { useCase, fileStore, uploadOwner };
    };

    it('브리더가 아니면 도메인 권한 예외를 던진다', async () => {
        const { useCase, fileStore } = createUseCase();

        await expect(useCase.execute([createImageFile('photo.jpg')], 'user-1', 'adopter')).rejects.toBeInstanceOf(
            DomainAuthorizationError,
        );
        expect(fileStore.uploadFiles).not.toHaveBeenCalled();
    });

    it('업로드한 대표 사진 경로를 사용자 대표 사진으로 저장한다', async () => {
        const { useCase, uploadOwner, fileStore } = createUseCase();

        await expect(useCase.execute([createImageFile('photo.jpg', 5120)], 'user-1', 'breeder')).resolves.toEqual([
            {
                url: 'https://cdn.test/representative/photo-1.jpg',
                cdnUrl: 'https://cdn.test/representative/photo-1.jpg',
                filename: 'representative/photo-1.jpg',
                fileName: 'representative/photo-1.jpg',
                size: 5120,
            },
        ]);

        expect(fileStore.uploadFiles).toHaveBeenCalledWith(expect.any(Array), 'representative');
        expect(uploadOwner.replaceRepresentativePhotos).toHaveBeenCalledWith('user-1', ['representative/photo-1.jpg']);
    });
});
