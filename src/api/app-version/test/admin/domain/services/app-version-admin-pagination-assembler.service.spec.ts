import { AppVersionAdminPaginationAssemblerService } from '../../../../admin/domain/services/app-version-admin-pagination-assembler.service';

describe('앱 버전 관리자 페이지네이션 조립 서비스', () => {
    it('앱 버전 목록 페이지네이션 응답 계약을 유지한다', () => {
        const service = new AppVersionAdminPaginationAssemblerService();

        expect(
            service.build(
                [
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
                        createdAt: '2026-04-06T00:00:00.000Z',
                        updatedAt: '2026-04-06T00:00:00.000Z',
                    },
                ],
                1,
                10,
                1,
            ),
        ).toMatchObject({
            items: [
                {
                    appVersionId: 'version-1',
                    latestVersion: '1.2.0',
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
            },
        });
    });
});
