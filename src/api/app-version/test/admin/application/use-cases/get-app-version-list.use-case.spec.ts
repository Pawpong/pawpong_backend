import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { GetAppVersionListUseCase } from '../../../../admin/application/use-cases/get-app-version-list.use-case';
import { type AppVersionAdminReaderPort } from '../../../../admin/application/ports/app-version-admin-reader.port';
import { AppVersionAdminPageAssemblerService } from '../../../../admin/domain/services/app-version-admin-page-assembler.service';
import { AppVersionAdminPaginationAssemblerService } from '../../../../admin/domain/services/app-version-admin-pagination-assembler.service';
import { AppVersionAdminItemMapperService } from '../../../../admin/domain/services/app-version-admin-item-mapper.service';

describe('앱 버전 목록 조회 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    const pageAssembler = new AppVersionAdminPageAssemblerService(
        new AppVersionAdminPaginationAssemblerService(),
        new AppVersionAdminItemMapperService(),
    );

    it('페이지 응답을 조립한다', async () => {
        const reader: AppVersionAdminReaderPort = {
            readPage: jest.fn().mockResolvedValue({
                items: [
                    {
                        appVersionId: 'version-1',
                        platform: 'ios',
                        latestVersion: '1.2.0',
                        minRequiredVersion: '1.0.0',
                        forceUpdateMessage: 'force',
                        recommendUpdateMessage: 'recommend',
                        iosStoreUrl: 'https://apps.apple.com/app/id1',
                        androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
                        isActive: true,
                        createdAt: new Date('2026-04-06T00:00:00.000Z'),
                        updatedAt: new Date('2026-04-06T00:00:00.000Z'),
                    },
                ],
                totalItems: 1,
            }),
        };
        const useCase = new GetAppVersionListUseCase(reader, pageAssembler, logger);

        await expect(useCase.execute({ page: 1, limit: 10 })).resolves.toMatchObject({
            items: [{ appVersionId: 'version-1', platform: 'ios' }],
            pagination: { currentPage: 1, pageSize: 10, totalItems: 1 },
        });
    });

    it('조회 실패 시 원본 예외를 유지한다', async () => {
        const useCase = new GetAppVersionListUseCase(
            {
                readPage: jest.fn().mockRejectedValue(new Error('boom')),
            },
            pageAssembler,
            logger,
        );

        await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('boom');
    });
});
