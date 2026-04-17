import { GetAllReferencedFilesUseCase } from '../../../application/use-cases/get-all-referenced-files.use-case';
import { UploadAdminReferenceReaderPort } from '../../../application/ports/upload-admin-reference-reader.port';

function makeReader(files: string[] = []): UploadAdminReferenceReaderPort {
    return {
        findReferences: jest.fn(),
        readAllReferencedFiles: jest.fn().mockResolvedValue(files),
    };
}

function makeLogger() {
    return { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn(), log: jest.fn(), error: jest.fn(), warn: jest.fn() };
}

describe('DB 참조 파일 전체 조회 유스케이스', () => {
    it('참조된 파일 경로 목록을 반환한다', async () => {
        const useCase = new GetAllReferencedFilesUseCase(
            makeReader(['profile/user-1.jpg', 'banners/banner-1.png']),
            makeLogger() as any,
        );

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
        expect(result[0]).toBe('profile/user-1.jpg');
    });

    it('참조 파일이 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetAllReferencedFilesUseCase(makeReader([]), makeLogger() as any);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });
});
