import { UploadAdminStorageListAssemblerService } from '../../../domain/services/upload-admin-storage-list-assembler.service';

describe('UploadAdminStorageListAssemblerService', () => {
    const service = new UploadAdminStorageListAssemblerService();

    it('파일 목록과 폴더별 통계를 생성한다', () => {
        const result = service.build(
            [
                { key: 'uploads/a.jpg', size: 100, lastModified: new Date(), url: 'url-1' },
                { key: 'uploads/b.jpg', size: 200, lastModified: new Date(), url: 'url-2' },
                { key: 'banners/c.png', size: 50, lastModified: new Date(), url: 'url-3' },
            ],
            false,
        );

        expect(result.totalFiles).toBe(3);
        expect(result.folderStats['uploads']).toEqual({ count: 2, totalSize: 300 });
        expect(result.folderStats['banners']).toEqual({ count: 1, totalSize: 50 });
    });

    it('/ 없는 키는 root 폴더로 분류한다', () => {
        const result = service.build([{ key: 'rootfile.jpg', size: 10, lastModified: new Date(), url: 'u' }], false);
        expect(result.folderStats['root']).toEqual({ count: 1, totalSize: 10 });
    });

    it('isTruncated 플래그가 반영된다', () => {
        const result = service.build([], true);
        expect(result.isTruncated).toBe(true);
        expect(result.files).toEqual([]);
    });
});
