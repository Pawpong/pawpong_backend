import { AppVersionAdminItemMapperService } from '../../../domain/services/app-version-admin-item-mapper.service';
import { AppVersionAdminSnapshot } from '../../../application/ports/app-version-admin-reader.port';

describe('AppVersionAdminItemMapperService', () => {
    const service = new AppVersionAdminItemMapperService();

    it('snapshot을 result로 매핑하고 Date 필드를 ISO 문자열로 변환한다', () => {
        const snapshot: AppVersionAdminSnapshot = {
            appVersionId: 'v-1',
            platform: 'ios',
            latestVersion: '1.0.0',
            minRequiredVersion: '0.9.0',
            forceUpdateMessage: '강제 업데이트',
            recommendUpdateMessage: '권장 업데이트',
            iosStoreUrl: 'https://apps.apple.com/app',
            androidStoreUrl: 'https://play.google.com/store/apps',
            isActive: true,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-04-01T00:00:00.000Z'),
        };

        const result = service.toResult(snapshot);

        expect(result.appVersionId).toBe('v-1');
        expect(result.platform).toBe('ios');
        expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
        expect(result.updatedAt).toBe('2026-04-01T00:00:00.000Z');
    });
});
