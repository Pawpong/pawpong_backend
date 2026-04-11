import { BadRequestException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { AppVersionAdminCommandPolicyService } from '../../../../admin/domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminItemPresentationService } from '../../../../admin/domain/services/app-version-admin-item-presentation.service';
import { type AppVersionWriterPort } from '../../../../admin/application/ports/app-version-writer.port';
import { CreateAppVersionUseCase } from '../../../../admin/application/use-cases/create-app-version.use-case';

describe('앱 버전 생성 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('유효한 명령이면 앱 버전을 생성한다', async () => {
        const appVersionWriter: AppVersionWriterPort = {
            create: jest.fn().mockResolvedValue({
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
            update: jest.fn(),
            delete: jest.fn(),
        };

        const useCase = new CreateAppVersionUseCase(
            appVersionWriter,
            new AppVersionAdminItemPresentationService(),
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(
            useCase.execute('admin-1', {
                platform: 'ios',
                latestVersion: '1.2.0',
                minRequiredVersion: '1.0.0',
                forceUpdateMessage: 'force',
                recommendUpdateMessage: 'recommend',
                iosStoreUrl: 'https://apps.apple.com/app/id1',
                androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
                isActive: true,
            }),
        ).resolves.toMatchObject({
            appVersionId: 'version-1',
            platform: 'ios',
        });
    });

    it('관리자 정보가 없으면 예외를 던진다', async () => {
        const useCase = new CreateAppVersionUseCase(
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new AppVersionAdminItemPresentationService(),
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(
            useCase.execute('', {
                platform: 'ios',
                latestVersion: '1.2.0',
                minRequiredVersion: '1.0.0',
                forceUpdateMessage: 'force',
                recommendUpdateMessage: 'recommend',
                iosStoreUrl: 'https://apps.apple.com/app/id1',
                androidStoreUrl: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
