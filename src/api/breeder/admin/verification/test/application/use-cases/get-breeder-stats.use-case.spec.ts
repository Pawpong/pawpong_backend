import { DomainAuthorizationError } from '../../../../../../../common/error/domain.error';
import { GetBreederStatsUseCase } from '../../../application/use-cases/get-breeder-stats.use-case';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminStatsResultMapperService } from '../../../domain/services/breeder-verification-admin-stats-result-mapper.service';
import { BreederVerificationAdminReaderPort } from '../../../application/ports/breeder-verification-admin-reader.port';

const adminWithPermission = { id: 'admin-1', name: '관리자', permissions: { canManageBreeders: true } };

function makeReader(overrides: Partial<{
    admin: any;
    stats: any;
}> = {}): BreederVerificationAdminReaderPort {
    const { admin = adminWithPermission, stats = { totalApproved: 100, eliteCount: 20 } } = overrides;
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getLevelChangeRequests: jest.fn(),
        getPendingBreeders: jest.fn(),
        getBreeders: jest.fn(),
        findBreederById: jest.fn(),
        getApprovedBreederStats: jest.fn().mockResolvedValue(stats),
        findApprovedBreedersMissingDocuments: jest.fn(),
    };
}

describe('브리더 통계 조회 유스케이스', () => {
    const policy = new BreederVerificationAdminPolicyService();
    const statsMapper = new BreederVerificationAdminStatsResultMapperService();

    it('승인된 브리더 통계를 반환한다', async () => {
        const useCase = new GetBreederStatsUseCase(makeReader(), policy, statsMapper);

        const result = await useCase.execute('admin-1');

        expect(result.totalApproved).toBe(100);
        expect(result.eliteCount).toBe(20);
        expect(result.newCount).toBe(80);
    });

    it('브리더 관리 권한이 없으면 DomainAuthorizationError를 던진다', async () => {
        const useCase = new GetBreederStatsUseCase(
            makeReader({ admin: { id: 'admin-2', name: '관리자', permissions: { canManageBreeders: false } } }),
            policy,
            statsMapper,
        );

        await expect(useCase.execute('admin-2')).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('관리자가 없으면 DomainAuthorizationError를 던진다', async () => {
        const useCase = new GetBreederStatsUseCase(makeReader({ admin: null }), policy, statsMapper);

        await expect(useCase.execute('not-found')).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
