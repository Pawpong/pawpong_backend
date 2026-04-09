import { ListFilesByFolderUseCase } from './list-files-by-folder.use-case';

describe('폴더별 파일 목록 조회 유스케이스', () => {
    it('폴더 접두 경로를 정규화한 뒤 목록 조회 포트에 위임한다', async () => {
        const uploadAdminStoragePolicyService = {
            normalizeFolderPrefix: jest.fn().mockReturnValue('folder/'),
        };
        const listAllFilesQuery = {
            execute: jest.fn().mockResolvedValue({ items: [], totalFiles: 0, folderStats: {}, isTruncated: false }),
        };
        const useCase = new ListFilesByFolderUseCase(
            uploadAdminStoragePolicyService as any,
            listAllFilesQuery as any,
        );

        await expect(useCase.execute('folder')).resolves.toEqual({
            items: [],
            totalFiles: 0,
            folderStats: {},
            isTruncated: false,
        });
        expect(listAllFilesQuery.execute).toHaveBeenCalledWith('folder/');
    });
});
