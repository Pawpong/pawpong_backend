import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../common/error/domain.error';
import type { UploadFileStorePort } from '../../../application/ports/upload-file-store.port';
import type { UploadOwnerPort } from '../../../application/ports/upload-owner.port';
import { UploadAvailablePetPhotosUseCase } from '../../../application/use-cases/upload-available-pet-photos.use-case';
import { UploadFilePolicyService } from '../../../domain/services/upload-file-policy.service';
import { UploadPhotoCollectionService } from '../../../domain/services/upload-photo-collection.service';
import { UploadResultMapperService } from '../../../domain/services/upload-result-mapper.service';
import { UploadStoredFilePathService } from '../../../domain/services/upload-stored-file-path.service';

const createImageFile = (originalname: string, size: number = 1024): Express.Multer.File =>
    ({
        originalname,
        mimetype: 'image/jpeg',
        size,
    }) as Express.Multer.File;

describe('분양 개체 사진 업로드 유스케이스', () => {
    const createUseCase = (
        fileStoreOverrides: Partial<UploadFileStorePort> = {},
        ownerOverrides: Partial<UploadOwnerPort> = {},
    ) => {
        const fileStore: UploadFileStorePort = {
            uploadFile: jest.fn(),
            uploadFiles: jest.fn().mockResolvedValue([
                {
                    fileName: 'pets/available/new-photo.jpg',
                    cdnUrl: 'https://cdn.test/pets/available/new-photo.jpg',
                    storageUrl: 'https://storage.test/pets/available/new-photo.jpg',
                },
            ]),
            deleteFile: jest.fn(),
            getBucketName: jest.fn().mockReturnValue('pawpong_s3'),
            ...fileStoreOverrides,
        };
        const uploadOwner: UploadOwnerPort = {
            replaceRepresentativePhotos: jest.fn(),
            findOwnedAvailablePet: jest.fn().mockResolvedValue({
                photoPaths: ['pets/available/existing-photo.jpg'],
            }),
            replaceAvailablePetPhotos: jest.fn().mockResolvedValue(undefined),
            findOwnedParentPet: jest.fn(),
            replaceParentPetPhotos: jest.fn(),
            ...ownerOverrides,
        };
        const useCase = new UploadAvailablePetPhotosUseCase(
            fileStore,
            uploadOwner,
            new UploadFilePolicyService(),
            new UploadStoredFilePathService(),
            new UploadPhotoCollectionService(),
            new UploadResultMapperService(),
        );

        return { useCase, fileStore, uploadOwner };
    };

    it('브리더가 아니면 도메인 권한 예외를 던진다', async () => {
        const { useCase, uploadOwner } = createUseCase();

        await expect(
            useCase.execute('pet-1', [createImageFile('photo.jpg')], [], 'user-1', 'adopter'),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
        expect(uploadOwner.findOwnedAvailablePet).not.toHaveBeenCalled();
    });

    it('소유한 분양 개체가 없으면 도메인 not found 예외를 던진다', async () => {
        const { useCase } = createUseCase({}, { findOwnedAvailablePet: jest.fn().mockResolvedValue(null) });

        await expect(
            useCase.execute('pet-1', [createImageFile('photo.jpg')], [], 'user-1', 'breeder'),
        ).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('기존 사진과 새 업로드 결과를 합쳐 저장한다', async () => {
        const { useCase, uploadOwner, fileStore } = createUseCase();

        await expect(
            useCase.execute(
                'pet-1',
                [createImageFile('photo.jpg', 2048)],
                ['pawpong_s3/pets/available/existing-photo.jpg'],
                'user-1',
                'breeder',
            ),
        ).resolves.toEqual([
            {
                url: 'https://cdn.test/pets/available/new-photo.jpg',
                cdnUrl: 'https://cdn.test/pets/available/new-photo.jpg',
                filename: 'pets/available/new-photo.jpg',
                fileName: 'pets/available/new-photo.jpg',
                size: 2048,
            },
        ]);

        expect(fileStore.uploadFiles).toHaveBeenCalledWith(expect.any(Array), 'pets/available');
        expect(uploadOwner.replaceAvailablePetPhotos).toHaveBeenCalledWith('pet-1', 'user-1', [
            'pets/available/existing-photo.jpg',
            'pets/available/new-photo.jpg',
        ]);
    });
});
