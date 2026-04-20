import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { GetAdminProfileUseCase } from '../../../application/use-cases/get-admin-profile.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminAdminProfileMapperService } from '../../../domain/services/user-admin-admin-profile-mapper.service';
import { UserAdminReaderPort } from '../../../application/ports/user-admin-reader.port';

function makeReader(admin: any = null): UserAdminReaderPort {
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getUsers: jest.fn(),
        findManagedUserById: jest.fn(),
        getDeletedUsers: jest.fn(),
        getDeletedUserStats: jest.fn(),
        listPhoneWhitelist: jest.fn(),
        findPhoneWhitelistById: jest.fn(),
        findPhoneWhitelistByPhoneNumber: jest.fn(),
    };
}

const mockAdmin = {
    id: 'admin-1',
    name: '관리자',
    email: 'admin@example.com',
    status: 'active',
    adminLevel: 'super_admin',
    permissions: { canManageUsers: true },
    activityLogs: [],
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('관리자 프로필 조회 유스케이스', () => {
    it('관리자 프로필을 반환한다', async () => {
        const useCase = new GetAdminProfileUseCase(
            makeReader(mockAdmin),
            new UserAdminCommandPolicyService(),
            new UserAdminAdminProfileMapperService(),
        );

        const result = await useCase.execute('admin-1');

        expect(result.id).toBe('admin-1');
        expect(result.name).toBe('관리자');
        expect(result.email).toBe('admin@example.com');
    });

    it('관리자가 없으면 DomainValidationError를 던진다', async () => {
        const useCase = new GetAdminProfileUseCase(
            makeReader(null),
            new UserAdminCommandPolicyService(),
            new UserAdminAdminProfileMapperService(),
        );

        await expect(useCase.execute('not-found')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
