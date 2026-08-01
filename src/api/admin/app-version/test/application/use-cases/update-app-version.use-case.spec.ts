import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { UpdateAppVersionUseCase } from '../../../application/use-cases/update-app-version.use-case';
import { AppVersionAdminItemMapperService } from '../../../domain/services/app-version-admin-item-mapper.service';
import { AppVersionAdminCommandPolicyService } from '../../../domain/services/app-version-admin-command-policy.service';
import { AppVersionWriterPort } from '../../../application/ports/app-version-writer.port';
import { AppVersionAdminSnapshot } from '../../../application/ports/app-version-admin-reader.port';

const updated: AppVersionAdminSnapshot = {
    appVersionId: 'v-1',
    platform: 'ios',
    latestVersion: '2.0.0',
    minRequiredVersion: '1.0.0',
    forceUpdateMessage: '업데이트 필요',
    recommendUpdateMessage: '업데이트 권장',
    iosStoreUrl: 'https://apps.apple.com/app',
    androidStoreUrl: 'https://play.google.com/store/apps',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
};

function makeWriter(result: AppVersionAdminSnapshot | null = updated): AppVersionWriterPort {
    return {
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(result),
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

describe('앱 버전 수정 유스케이스', () => {
    const itemMapper = new AppVersionAdminItemMapperService();
    const commandPolicy = new AppVersionAdminCommandPolicyService();

    it('앱 버전을 수정하고 결과 객체를 반환한다', async () => {
        const useCase = new UpdateAppVersionUseCase(makeWriter(), itemMapper, commandPolicy, makeLogger() as any);

        const result = await useCase.execute('v-1', 'admin-1', { latestVersion: '2.0.0' });

        expect(result.latestVersion).toBe('2.0.0');
    });

    it('앱 버전이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new UpdateAppVersionUseCase(makeWriter(null), itemMapper, commandPolicy, makeLogger() as any);

        await expect(useCase.execute('not-found', 'admin-1', {})).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('appVersionId가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new UpdateAppVersionUseCase(makeWriter(), itemMapper, commandPolicy, makeLogger() as any);

        await expect(useCase.execute('', 'admin-1', {})).rejects.toBeInstanceOf(DomainValidationError);
    });
});
