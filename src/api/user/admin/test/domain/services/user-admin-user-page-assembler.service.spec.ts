import { UserAdminUserPageAssemblerService } from '../../../domain/services/user-admin-user-page-assembler.service';
import { UserAdminPaginationAssemblerService } from '../../../domain/services/user-admin-pagination-assembler.service';

describe('UserAdminUserPageAssemblerService', () => {
    const service = new UserAdminUserPageAssemblerService(new UserAdminPaginationAssemblerService());

    it('스냅샷을 item으로 매핑하고 페이지네이션 결과를 반환한다', () => {
        const result = service.build(
            {
                items: [
                    {
                        id: 'u-1',
                        nickname: '닉',
                        emailAddress: 'a@b.com',
                        accountStatus: 'active',
                        role: 'adopter',
                        lastLoginAt: new Date('2026-01-01'),
                        createdAt: new Date('2026-01-01'),
                        stats: { totalApplications: 2 },
                    } as any,
                ],
                total: 1,
            },
            1,
            10,
        );
        expect(result.items).toHaveLength(1);
        expect(result.items[0].userId).toBe('u-1');
        expect(result.items[0].userName).toBe('닉');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('nickname이 없으면 name을 사용한다', () => {
        const result = service.build(
            {
                items: [
                    {
                        id: 'u-2',
                        name: '이름',
                        emailAddress: 'b@c.com',
                        accountStatus: 'active',
                        role: 'breeder',
                    } as any,
                ],
                total: 1,
            },
            1,
            10,
        );
        expect(result.items[0].userName).toBe('이름');
    });

    it('nickname/name 모두 없으면 빈 문자열', () => {
        const result = service.build(
            {
                items: [{ id: 'u-3', emailAddress: 'c@d.com', accountStatus: 'active', role: 'adopter' } as any],
                total: 1,
            },
            1,
            10,
        );
        expect(result.items[0].userName).toBe('');
    });
});
