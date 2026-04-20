import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import type { UploadFileStorePort } from '../../../application/ports/upload-file-store.port';
import type { UploadOwnerPort } from '../../../application/ports/upload-owner.port';
import { UploadParentPetPhotosUseCase } from '../../../application/use-cases/upload-parent-pet-photos.use-case';
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

describe('부모견/묘 사진 업로드 유스케이스', () => {
    const createUseCase = (ownerOverrides: Partial<UploadOwnerPort> = {}) => {
        const fileStore: UploadFileStorePort = {
            uploadFile: jest.fn(),
            uploadFiles: jest.fn().mockResolvedValue([
                {
                    fileName: 'pets/parent/new-photo.jpg',
                    cdnUrl: 'https://cdn.test/pets/parent/new-photo.jpg',
                    storageUrl: 'https://storage.test/pets/parent/new-photo.jpg',
                },
            ]),
            deleteFile: jest.fn(),
            getBucketName: jest.fn().mockReturnValue('pawpong_s3'),
        };
        const uploadOwner: UploadOwnerPort = {
            replaceRepresentativePhotos: jest.fn(),
            findOwnedAvailablePet: jest.fn(),
            replaceAvailablePetPhotos: jest.fn(),
            findOwnedParentPet: jest.fn().mockResolvedValue({
                photoPaths: ['pets/parent/existing-photo.jpg'],
            }),
            replaceParentPetPhotos: jest.fn().mockResolvedValue(undefined),
            ...ownerOverrides,
        };
        const useCase = new UploadParentPetPhotosUseCase(
            fileStore,
            uploadOwner,
            new UploadFilePolicyService(),
            new UploadStoredFilePathService(),
            new UploadPhotoCollectionService(),
            new UploadResultMapperService(),
        );

        return { useCase, uploadOwner };
    };

    it('소유한 부모견/묘가 없으면 도메인 not found 예외를 던진다', async () => {
        const { useCase } = createUseCase({ findOwnedParentPet: jest.fn().mockResolvedValue(null) });

        await expect(
            useCase.execute('pet-1', [createImageFile('photo.jpg')], [], 'user-1', 'breeder'),
        ).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('기존 부모견/묘 사진과 새 업로드 결과를 합쳐 저장한다', async () => {
        const { useCase, uploadOwner } = createUseCase();

        await expect(
            useCase.execute(
                'pet-1',
                [createImageFile('photo.jpg', 4096)],
                ['pawpong_s3/pets/parent/existing-photo.jpg'],
                'user-1',
                'breeder',
            ),
        ).resolves.toEqual([
            {
                url: 'https://cdn.test/pets/parent/new-photo.jpg',
                cdnUrl: 'https://cdn.test/pets/parent/new-photo.jpg',
                filename: 'pets/parent/new-photo.jpg',
                fileName: 'pets/parent/new-photo.jpg',
                size: 4096,
            },
        ]);

        expect(uploadOwner.replaceParentPetPhotos).toHaveBeenCalledWith('pet-1', 'user-1', [
            'pets/parent/existing-photo.jpg',
            'pets/parent/new-photo.jpg',
        ]);
    });
});
