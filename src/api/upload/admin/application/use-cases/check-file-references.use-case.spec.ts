import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminReferenceReaderPort } from '../ports/upload-admin-reference-reader.port';
import { CheckFileReferencesUseCase } from './check-file-references.use-case';

describe('CheckFileReferencesUseCase', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
    } as unknown as CustomLoggerService;

    it('참조 여부를 파일별로 집계한다', async () => {
        const uploadAdminReferenceReader: UploadAdminReferenceReaderPort = {
            findReferences: jest
                .fn()
                .mockResolvedValueOnce([{ collection: 'breeders', field: 'profileImageFileName', count: 1 }])
                .mockResolvedValueOnce([]),
            readAllReferencedFiles: jest.fn(),
        };
        const useCase = new CheckFileReferencesUseCase(uploadAdminReferenceReader, logger);

        await expect(useCase.execute(['profiles/a.jpg', 'profiles/b.jpg'])).resolves.toEqual({
            files: [
                {
                    fileKey: 'profiles/a.jpg',
                    isReferenced: true,
                    references: [{ collection: 'breeders', field: 'profileImageFileName', count: 1 }],
                },
                {
                    fileKey: 'profiles/b.jpg',
                    isReferenced: false,
                    references: [],
                },
            ],
            referencedCount: 1,
            orphanedCount: 1,
        });
    });
});
