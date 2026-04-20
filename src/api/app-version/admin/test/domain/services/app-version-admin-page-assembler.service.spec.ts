import { AppVersionAdminPageAssemblerService } from '../../../domain/services/app-version-admin-page-assembler.service';
import { AppVersionAdminPaginationAssemblerService } from '../../../domain/services/app-version-admin-pagination-assembler.service';
import { AppVersionAdminItemMapperService } from '../../../domain/services/app-version-admin-item-mapper.service';
import { AppVersionAdminSnapshot } from '../../../application/ports/app-version-admin-reader.port';

function makeSnapshot(id: string): AppVersionAdminSnapshot {
    return {
        appVersionId: id,
        platform: 'ios',
        latestVersion: '1.0.0',
        minRequiredVersion: '0.9.0',
        forceUpdateMessage: '',
        recommendUpdateMessage: '',
        iosStoreUrl: '',
        androidStoreUrl: '',
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
}

describe('AppVersionAdminPageAssemblerService', () => {
    const service = new AppVersionAdminPageAssemblerService(
        new AppVersionAdminPaginationAssemblerService(),
        new AppVersionAdminItemMapperService(),
    );

    it('snapshot 배열을 result 배열로 매핑하고 pagination을 구성한다', () => {
        const result = service.build([makeSnapshot('v-1'), makeSnapshot('v-2')], 1, 10, 2);

        expect(result.items).toHaveLength(2);
        expect(result.items[0].appVersionId).toBe('v-1');
        expect(result.items[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
        expect(result.pagination.totalItems).toBe(2);
    });

    it('빈 배열도 처리한다', () => {
        const result = service.build([], 1, 10, 0);
        expect(result.items).toEqual([]);
        expect(result.pagination.totalPages).toBe(0);
    });
});
