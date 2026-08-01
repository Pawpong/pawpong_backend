import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { CreateAppVersionUseCase } from '../../../application/use-cases/create-app-version.use-case';
import { AppVersionAdminItemMapperService } from '../../../domain/services/app-version-admin-item-mapper.service';
import { AppVersionAdminCommandPolicyService } from '../../../domain/services/app-version-admin-command-policy.service';
import { AppVersionWriterPort } from '../../../application/ports/app-version-writer.port';
import { AppVersionAdminSnapshot } from '../../../application/ports/app-version-admin-reader.port';

const created: AppVersionAdminSnapshot = {
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
};

function makeWriter(snapshot: AppVersionAdminSnapshot = created): AppVersionWriterPort {
    return {
        create: jest.fn().mockResolvedValue(snapshot),
        update: jest.fn(),
        delete: jest.fn(),
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
    };
}

describe('앱 버전 생성 유스케이스', () => {
    const itemMapper = new AppVersionAdminItemMapperService();
    const commandPolicy = new AppVersionAdminCommandPolicyService();

    it('앱 버전을 생성하고 결과 객체를 반환한다', async () => {
        const useCase = new CreateAppVersionUseCase(makeWriter(), itemMapper, commandPolicy, makeLogger() as any);

        const result = await useCase.execute('admin-1', {
            platform: 'ios',
            latestVersion: '1.0.0',
            minRequiredVersion: '0.9.0',
            forceUpdateMessage: '업데이트 필요',
            recommendUpdateMessage: '업데이트 권장',
            iosStoreUrl: 'https://apps.apple.com/app',
            androidStoreUrl: 'https://play.google.com/store/apps',
            isActive: true,
        });

        expect(result.appVersionId).toBe('v-1');
        expect(result.platform).toBe('ios');
    });

    it('adminId가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new CreateAppVersionUseCase(makeWriter(), itemMapper, commandPolicy, makeLogger() as any);

        await expect(
            useCase.execute('', {
                platform: 'android',
                latestVersion: '1.0.0',
                minRequiredVersion: '0.9.0',
                forceUpdateMessage: '업데이트 필요',
                recommendUpdateMessage: '업데이트 권장',
                iosStoreUrl: '',
                androidStoreUrl: '',
                isActive: true,
            }),
        ).rejects.toBeInstanceOf(DomainValidationError);
    });
});
