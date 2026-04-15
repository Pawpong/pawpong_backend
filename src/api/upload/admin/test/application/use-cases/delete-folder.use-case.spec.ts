import { DomainValidationError } from '../../../../../../common/error/domain.error';

import { DeleteFolderUseCase } from '../../../application/use-cases/delete-folder.use-case';

describe('폴더 삭제 유스케이스', () => {
    const uploadAdminStorage = {
        list: jest.fn(),
    };
    const uploadAdminStoragePolicyService = {
        normalizeFolderPrefix: jest.fn().mockImplementation((folder: string) => `${folder}/`),
        ensureFileNames: jest.fn().mockImplementation((fileNames: string[]) => {
            if (fileNames.length === 0) {
                throw new DomainValidationError('삭제할 파일이 없습니다.');
            }
        }),
    };
    const deleteMultipleFilesCommand = {
        execute: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
    };
    const useCase = new DeleteFolderUseCase(
        uploadAdminStorage as any,
        uploadAdminStoragePolicyService as any,
        deleteMultipleFilesCommand as any,
        logger as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('폴더 내 파일 목록을 조회한 뒤 삭제 명령에 위임한다', async () => {
        uploadAdminStorage.list.mockResolvedValue({
            files: [{ key: 'folder/a.png' }, { key: 'folder/b.png' }],
        });
        deleteMultipleFilesCommand.execute.mockResolvedValue({ deletedCount: 2, failedFiles: [] });

        await expect(useCase.execute('folder')).resolves.toEqual({ deletedCount: 2, failedFiles: [] });
        expect(deleteMultipleFilesCommand.execute).toHaveBeenCalledWith(['folder/a.png', 'folder/b.png']);
    });

    it('삭제할 파일이 없으면 예외를 던진다', async () => {
        uploadAdminStorage.list.mockResolvedValue({ files: [] });

        await expect(useCase.execute('empty')).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('empty')).rejects.toThrow('삭제할 파일이 없습니다.');
    });
});
