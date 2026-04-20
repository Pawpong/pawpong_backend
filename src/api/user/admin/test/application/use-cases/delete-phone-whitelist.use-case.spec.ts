import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { DeletePhoneWhitelistUseCase } from '../../../application/use-cases/delete-phone-whitelist.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminReaderPort, UserAdminPhoneWhitelistSnapshot } from '../../../application/ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../../../application/ports/user-admin-writer.port';

function makeReader(item: UserAdminPhoneWhitelistSnapshot | null): UserAdminReaderPort {
    return {
        findAdminById: jest.fn(),
        getUsers: jest.fn(),
        findManagedUserById: jest.fn(),
        getDeletedUsers: jest.fn(),
        getDeletedUserStats: jest.fn(),
        listPhoneWhitelist: jest.fn(),
        findPhoneWhitelistById: jest.fn().mockResolvedValue(item),
        findPhoneWhitelistByPhoneNumber: jest.fn(),
    };
}

function makeWriter(): UserAdminWriterPort {
    return {
        updateManagedUser: jest.fn(),
        deleteManagedUser: jest.fn(),
        appendAdminActivityLog: jest.fn(),
        createPhoneWhitelist: jest.fn(),
        updatePhoneWhitelist: jest.fn(),
        deletePhoneWhitelist: jest.fn().mockResolvedValue(true),
    };
}

const existingItem: UserAdminPhoneWhitelistSnapshot = {
    id: 'wl-1',
    phoneNumber: '01012345678',
    description: '테스트',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('전화번호 화이트리스트 삭제 유스케이스', () => {
    it('존재하는 항목을 삭제하고 메시지를 반환한다', async () => {
        const useCase = new DeletePhoneWhitelistUseCase(
            makeReader(existingItem),
            makeWriter(),
            new UserAdminCommandPolicyService(),
        );

        const result = await useCase.execute('wl-1');

        expect(result.message).toContain('삭제');
    });

    it('존재하지 않는 항목이면 DomainValidationError를 던진다', async () => {
        const useCase = new DeletePhoneWhitelistUseCase(
            makeReader(null),
            makeWriter(),
            new UserAdminCommandPolicyService(),
        );

        await expect(useCase.execute('not-found')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
