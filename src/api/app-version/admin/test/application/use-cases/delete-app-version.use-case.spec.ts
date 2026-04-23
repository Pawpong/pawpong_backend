import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { DeleteAppVersionUseCase } from '../../../application/use-cases/delete-app-version.use-case';
import { AppVersionAdminCommandPolicyService } from '../../../domain/services/app-version-admin-command-policy.service';
import { AppVersionWriterPort } from '../../../application/ports/app-version-writer.port';

function makeWriter(deleted = true): AppVersionWriterPort {
    return {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue(deleted),
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

describe('앱 버전 삭제 유스케이스', () => {
    const commandPolicy = new AppVersionAdminCommandPolicyService();

    it('앱 버전을 삭제한다', async () => {
        const useCase = new DeleteAppVersionUseCase(makeWriter(true), commandPolicy, makeLogger() as any);

        await expect(useCase.execute('v-1', 'admin-1')).resolves.toBeUndefined();
    });

    it('앱 버전이 없으면 DomainNotFoundError를 던진다', async () => {
        const useCase = new DeleteAppVersionUseCase(makeWriter(false), commandPolicy, makeLogger() as any);

        await expect(useCase.execute('not-found', 'admin-1')).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('appVersionId가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new DeleteAppVersionUseCase(makeWriter(), commandPolicy, makeLogger() as any);

        await expect(useCase.execute('', 'admin-1')).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('adminId가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new DeleteAppVersionUseCase(makeWriter(), commandPolicy, makeLogger() as any);

        await expect(useCase.execute('v-1', '')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
