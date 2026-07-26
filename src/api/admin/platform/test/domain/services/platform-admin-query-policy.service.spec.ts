import { DomainAuthorizationError } from '../../../../../../common/error/domain.error';
import { PlatformAdminQueryPolicyService } from '../../../domain/services/platform-admin-query-policy.service';

describe('PlatformAdminQueryPolicyService', () => {
    const policy = new PlatformAdminQueryPolicyService();

    it('통계 권한이 있으면 admin을 반환한다', () => {
        const admin = { id: 'a-1', permissions: { canViewStatistics: true } };
        expect(policy.assertCanViewStatistics(admin as any, 'denied')).toBe(admin);
    });

    it('admin이 null이면 DomainAuthorizationError를 던진다', () => {
        expect(() => policy.assertCanViewStatistics(null, '권한 없음')).toThrow(DomainAuthorizationError);
    });

    it('canViewStatistics 권한이 없으면 DomainAuthorizationError를 던진다', () => {
        expect(() =>
            policy.assertCanViewStatistics(
                { id: 'a-1', permissions: { canViewStatistics: false } } as any,
                '권한 없음',
            ),
        ).toThrow(DomainAuthorizationError);
    });
});
