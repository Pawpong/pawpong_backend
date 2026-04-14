import { UserAdminDeletedUserCommandResultMapperService } from '../domain/services/user-admin-deleted-user-command-result-mapper.service';

describe('사용자 관리자 탈퇴 사용자 명령 결과 매퍼', () => {
    const service = new UserAdminDeletedUserCommandResultMapperService();

    it('복구 결과를 만든다', () => {
        expect(
            service.toRestoreDeletedUserResult('user-1', 'adopter', 'deleted', new Date('2026-04-09T01:00:00.000Z')),
        ).toEqual({
            userId: 'user-1',
            role: 'adopter',
            previousStatus: 'deleted',
            newStatus: 'active',
            updatedAt: '2026-04-09T01:00:00.000Z',
            message: '입양자 계정이 복구되었습니다.',
        });
    });

    it('영구 삭제 결과를 만든다', () => {
        const realDateNow = Date.now;
        Date.now = jest.fn(() => new Date('2026-04-09T02:00:00.000Z').getTime()) as any;

        expect(service.toHardDeleteUserResult('user-2', 'breeder', '브리더', 'breeder@test.com')).toMatchObject({
            userId: 'user-2',
            role: 'breeder',
            userName: '브리더',
            userEmail: 'breeder@test.com',
            message: '브리더 데이터가 영구적으로 삭제되었습니다.',
        });

        Date.now = realDateNow;
    });
});
