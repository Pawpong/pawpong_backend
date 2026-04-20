import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { DeleteAppVersionUseCase } from '../../../../admin/application/use-cases/delete-app-version.use-case';
import { AppVersionAdminCommandPolicyService } from '../../../../admin/domain/services/app-version-admin-command-policy.service';
import { type AppVersionWriterPort } from '../../../../admin/application/ports/app-version-writer.port';

describe('앱 버전 삭제 유스케이스', () => {
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    it('삭제 대상이 있으면 정상 종료한다', async () => {
        const useCase = new DeleteAppVersionUseCase(
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn().mockResolvedValue(true),
            },
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(useCase.execute('version-1', 'admin-1')).resolves.toBeUndefined();
    });

    it('대상이 없으면 도메인 not found 예외를 던진다', async () => {
        const appVersionWriter: AppVersionWriterPort = {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn().mockResolvedValue(false),
        };
        const useCase = new DeleteAppVersionUseCase(
            appVersionWriter,
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(useCase.execute('missing', 'admin-1')).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('관리자 정보가 없으면 도메인 validation 예외를 던진다', async () => {
        const useCase = new DeleteAppVersionUseCase(
            {
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
            new AppVersionAdminCommandPolicyService(),
            logger,
        );

        await expect(useCase.execute('version-1', '')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
