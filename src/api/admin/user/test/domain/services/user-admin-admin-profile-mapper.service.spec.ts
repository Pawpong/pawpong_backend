import { UserAdminAdminProfileMapperService } from '../../../domain/services/user-admin-admin-profile-mapper.service';

describe('UserAdminAdminProfileMapperService', () => {
    const service = new UserAdminAdminProfileMapperService();

    function makeAdmin(overrides: any = {}): any {
        return {
            id: 'a-1',
            name: '관리자',
            email: 'admin@example.com',
            status: 'active',
            adminLevel: 'super_admin',
            permissions: { canManageUsers: true },
            activityLogs: Array.from({ length: 15 }, (_, i) => ({ logId: `l-${i}` })),
            createdAt: new Date('2026-01-01'),
            lastLoginAt: new Date('2026-04-01'),
            ...overrides,
        };
    }

    it('관리자 스냅샷을 프로필 결과로 매핑한다', () => {
        const result = service.toResult(makeAdmin());
        expect(result.id).toBe('a-1');
        expect(result.email).toBe('admin@example.com');
    });

    it('activityLogs가 15개면 뒤에서 10개만 반환한다', () => {
        const result = service.toResult(makeAdmin());
        expect(result.activityLogs).toHaveLength(10);
        expect(result.activityLogs?.[0].logId).toBe('l-5');
    });

    it('activityLogs가 없으면 빈 배열을 반환한다', () => {
        const result = service.toResult(makeAdmin({ activityLogs: undefined }));
        expect(result.activityLogs).toEqual([]);
    });
});
