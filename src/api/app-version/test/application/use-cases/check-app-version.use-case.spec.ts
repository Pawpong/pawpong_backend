import { DomainValidationError } from '../../../../../common/error/domain.error';
import { CheckAppVersionUseCase } from '../../../application/use-cases/check-app-version.use-case';
import { AppVersionReaderPort } from '../../../application/ports/app-version-reader.port';
import { AppVersionPolicyService } from '../../../domain/services/app-version-policy.service';

describe('앱 버전 확인 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('활성 버전이 없으면 현재 버전을 그대로 반환한다', async () => {
        const appVersionReader: AppVersionReaderPort = {
            findLatestActiveByPlatform: jest.fn().mockResolvedValue(null),
        };
        const useCase = new CheckAppVersionUseCase(appVersionReader, new AppVersionPolicyService(), logger as any);

        await expect(useCase.execute('ios', '1.0.0')).resolves.toEqual({
            needsForceUpdate: false,
            needsRecommendUpdate: false,
            latestVersion: '1.0.0',
            message: '',
            storeUrl: '',
        });
    });

    it('최소 요구 버전보다 낮으면 강제 업데이트를 반환한다', async () => {
        const appVersionReader: AppVersionReaderPort = {
            findLatestActiveByPlatform: jest.fn().mockResolvedValue({
                latestVersion: '1.3.0',
                minRequiredVersion: '1.2.0',
                forceUpdateMessage: '강제 업데이트',
                recommendUpdateMessage: '권장 업데이트',
                iosStoreUrl: 'https://apps.apple.com/app/pawpong/id1',
                androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
            }),
        };
        const useCase = new CheckAppVersionUseCase(appVersionReader, new AppVersionPolicyService(), logger as any);

        await expect(useCase.execute('ios', '1.1.9')).resolves.toEqual({
            needsForceUpdate: true,
            needsRecommendUpdate: false,
            latestVersion: '1.3.0',
            message: '강제 업데이트',
            storeUrl: 'https://apps.apple.com/app/pawpong/id1',
        });
    });

    it('플랫폼 또는 현재 버전이 없으면 예외를 던진다', async () => {
        const appVersionReader: AppVersionReaderPort = {
            findLatestActiveByPlatform: jest.fn(),
        };
        const useCase = new CheckAppVersionUseCase(appVersionReader, new AppVersionPolicyService(), logger as any);

        await expect(useCase.execute(undefined as any, '1.0.0')).rejects.toBeInstanceOf(DomainValidationError);
        await expect(useCase.execute('android', '')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
