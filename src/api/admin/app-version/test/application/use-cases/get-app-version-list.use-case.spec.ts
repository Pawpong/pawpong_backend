import { GetAppVersionListUseCase } from '../../../application/use-cases/get-app-version-list.use-case';
import { AppVersionAdminPageAssemblerService } from '../../../domain/services/app-version-admin-page-assembler.service';
import { AppVersionAdminPaginationAssemblerService } from '../../../domain/services/app-version-admin-pagination-assembler.service';
import { AppVersionAdminItemMapperService } from '../../../domain/services/app-version-admin-item-mapper.service';
import {
    AppVersionAdminReaderPort,
    AppVersionAdminSnapshot,
} from '../../../application/ports/app-version-admin-reader.port';

function makeSnapshot(overrides: Partial<AppVersionAdminSnapshot> = {}): AppVersionAdminSnapshot {
    return {
        appVersionId: 'v-1',
        platform: 'ios',
        latestVersion: '1.0.0',
        minRequiredVersion: '0.9.0',
        forceUpdateMessage: '업데이트 필요',
        recommendUpdateMessage: '업데이트 권장',
        iosStoreUrl: 'https://apps.apple.com/app',
        androidStoreUrl: 'https://play.google.com/store/apps',
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

function makeReader(items: AppVersionAdminSnapshot[] = [], totalItems = 0): AppVersionAdminReaderPort {
    return {
        readPage: jest.fn().mockResolvedValue({ items, totalItems }),
    };
}

function makeLogger() {
    return {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
    };
}

describe('앱 버전 목록 조회 유스케이스', () => {
    const pageAssembler = new AppVersionAdminPageAssemblerService(
        new AppVersionAdminPaginationAssemblerService(),
        new AppVersionAdminItemMapperService(),
    );

    it('앱 버전 목록을 반환한다', async () => {
        const useCase = new GetAppVersionListUseCase(
            makeReader([makeSnapshot()], 1),
            pageAssembler,
            makeLogger() as any,
        );

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
    });

    it('앱 버전이 없으면 빈 목록을 반환한다', async () => {
        const useCase = new GetAppVersionListUseCase(makeReader([], 0), pageAssembler, makeLogger() as any);

        const result = await useCase.execute({});

        expect(result.items).toEqual([]);
    });

    it('페이지와 제한 기본값을 적용한다', async () => {
        const reader = makeReader([], 0);
        const useCase = new GetAppVersionListUseCase(reader, pageAssembler, makeLogger() as any);

        await useCase.execute({});

        expect(reader.readPage).toHaveBeenCalledWith(1, 10);
    });
});
