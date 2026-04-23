import { DomainValidationError } from '../../../../../common/error/domain.error';
import { UploadFilePolicyService } from '../../../domain/services/upload-file-policy.service';

function makeImage(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    return {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from(''),
        destination: '',
        filename: 'test.jpg',
        path: '',
        stream: null as any,
        ...overrides,
    };
}

describe('UploadFilePolicyService', () => {
    const policy = new UploadFilePolicyService();

    describe('ensureRepresentativePhotos', () => {
        it('이미지 파일을 1~3장 업로드하면 통과한다', () => {
            expect(() => policy.ensureRepresentativePhotos([makeImage()])).not.toThrow();
            expect(() => policy.ensureRepresentativePhotos([makeImage(), makeImage(), makeImage()])).not.toThrow();
        });

        it('파일이 없으면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureRepresentativePhotos([])).toThrow(DomainValidationError);
        });

        it('4장 이상이면 DomainValidationError를 던진다', () => {
            expect(() =>
                policy.ensureRepresentativePhotos([makeImage(), makeImage(), makeImage(), makeImage()]),
            ).toThrow('최대 3장');
        });

        it('허용되지 않은 mimetype은 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureRepresentativePhotos([makeImage({ mimetype: 'application/pdf' })])).toThrow(
                DomainValidationError,
            );
        });

        it('영상 파일도 허용한다', () => {
            expect(() => policy.ensureRepresentativePhotos([makeImage({ mimetype: 'video/mp4' })])).not.toThrow();
        });

        it('영상 파일이 100MB를 초과하면 DomainValidationError를 던진다', () => {
            const over = makeImage({ mimetype: 'video/mp4', size: 101 * 1024 * 1024 });
            expect(() => policy.ensureRepresentativePhotos([over])).toThrow('100MB');
        });
    });

    describe('ensurePublicSingleFile', () => {
        it('파일이 있으면 통과한다', () => {
            expect(() => policy.ensurePublicSingleFile(makeImage())).not.toThrow();
        });

        it('파일이 없으면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensurePublicSingleFile(undefined)).toThrow(DomainValidationError);
        });
    });

    describe('ensurePublicMultipleFiles', () => {
        it('파일이 1장 이상이면 통과한다', () => {
            expect(() => policy.ensurePublicMultipleFiles([makeImage()])).not.toThrow();
        });

        it('빈 배열이면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensurePublicMultipleFiles([])).toThrow(DomainValidationError);
        });
    });

    describe('ensurePetPhotoLimit', () => {
        it('총합이 5장 이하면 통과한다', () => {
            expect(() => policy.ensurePetPhotoLimit(2, 3)).not.toThrow();
            expect(() => policy.ensurePetPhotoLimit(0, 5)).not.toThrow();
        });

        it('총합이 6장 이상이면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensurePetPhotoLimit(3, 3)).toThrow('최대 5장');
        });
    });

    describe('validatePetPhotoFiles', () => {
        it('첫 업로드의 첫 번째는 이미지만 허용한다', () => {
            expect(() => policy.validatePetPhotoFiles([makeImage({ mimetype: 'video/mp4' })], 0)).toThrow(
                '이미지 파일만',
            );
        });

        it('첫 업로드의 첫 번째가 이미지면 통과한다', () => {
            expect(() => policy.validatePetPhotoFiles([makeImage()], 0)).not.toThrow();
        });

        it('기존 사진이 있으면 첫 번째도 영상 허용', () => {
            expect(() => policy.validatePetPhotoFiles([makeImage({ mimetype: 'video/mp4' })], 1)).not.toThrow();
        });
    });
});
