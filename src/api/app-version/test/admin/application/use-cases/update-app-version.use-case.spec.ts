import { DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { AppVersionAdminCommandPolicyService } from '../../../../admin/domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminItemMapperService } from '../../../../admin/domain/services/app-version-admin-item-mapper.service';
import { UpdateAppVersionUseCase } from '../../../../admin/application/use-cases/update-app-version.use-case';
import { AppVersionWriterPort } from '../../../../admin/application/ports/app-version-writer.port';

describe('앱 버전 수정 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('앱 버전이 있으면 수정된 응답을 반환한다', async () => {
        const appVersionWriter: AppVersionWriterPort = {
            create: jest.fn(),
            update: jest.fn().mockResolvedValue({
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
            }),
            delete: jest.fn(),
        };
        const useCase = new UpdateAppVersionUseCase(
            appVersionWriter,
            new AppVersionAdminItemMapperService(),
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(
            useCase.execute('version-1', 'admin-1', {
                latestVersion: '1.2.0',
            }),
        ).resolves.toMatchObject({
            appVersionId: 'version-1',
            latestVersion: '1.2.0',
        });
    });

    it('앱 버전이 없으면 예외을 던진다', async () => {
        const useCase = new UpdateAppVersionUseCase(
            {
                create: jest.fn(),
                update: jest.fn().mockResolvedValue(null),
                delete: jest.fn(),
            },
            new AppVersionAdminItemMapperService(),
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(useCase.execute('missing', 'admin-1', {})).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('관리자 정보가 없으면 예외을 던진다', async () => {
        const useCase = new UpdateAppVersionUseCase(
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new AppVersionAdminItemMapperService(),
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(useCase.execute('version-1', '', {})).rejects.toBeInstanceOf(DomainValidationError);
    });
});
