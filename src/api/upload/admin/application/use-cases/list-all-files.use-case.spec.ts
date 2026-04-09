import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { UploadAdminStoragePresentationService } from '../../domain/services/upload-admin-storage-presentation.service';
import { UploadAdminStoragePort } from '../ports/upload-admin-storage.port';
import { ListAllFilesUseCase } from './list-all-files.use-case';

describe('전체 파일 목록 조회 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('스토리지 목록을 응답 객체와 폴더 통계로 변환한다', async () => {
        const uploadAdminStorage: UploadAdminStoragePort = {
            list: jest.fn().mockResolvedValue({
                files: [
                    {
                        key: 'profiles/a.jpg',
                        size: 10,
                        lastModified: new Date('2026-04-06T00:00:00.000Z'),
                        url: 'https://cdn.example.com/profiles/a.jpg',
                    },
                    {
                        key: 'profiles/b.jpg',
                        size: 15,
                        lastModified: new Date('2026-04-06T01:00:00.000Z'),
                        url: 'https://cdn.example.com/profiles/b.jpg',
                    },
                ],
                isTruncated: false,
            }),
            delete: jest.fn(),
        };
        const useCase = new ListAllFilesUseCase(
            uploadAdminStorage,
            new UploadAdminStoragePresentationService(),
            logger,
        );

        await expect(useCase.execute()).resolves.toMatchObject({
            totalFiles: 2,
            isTruncated: false,
            folderStats: {
                profiles: {
                    count: 2,
                    totalSize: 25,
                },
            },
        });
    });
});
