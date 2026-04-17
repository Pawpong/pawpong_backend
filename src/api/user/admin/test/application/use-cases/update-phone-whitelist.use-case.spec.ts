import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { UpdatePhoneWhitelistUseCase } from '../../../application/use-cases/update-phone-whitelist.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminPhoneWhitelistResultMapperService } from '../../../domain/services/user-admin-phone-whitelist-result-mapper.service';
import { UserAdminReaderPort, UserAdminPhoneWhitelistSnapshot } from '../../../application/ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../../../application/ports/user-admin-writer.port';

const existingItem: UserAdminPhoneWhitelistSnapshot = {
    id: 'wl-1',
    phoneNumber: '01012345678',
    description: '기존 설명',
    isActive: true,
    createdBy: 'admin-1',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

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

function makeWriter(updatedItem: UserAdminPhoneWhitelistSnapshot | null): UserAdminWriterPort {
    return {
        updateManagedUser: jest.fn(),
        deleteManagedUser: jest.fn(),
        appendAdminActivityLog: jest.fn(),
        createPhoneWhitelist: jest.fn(),
        updatePhoneWhitelist: jest.fn().mockResolvedValue(updatedItem),
        deletePhoneWhitelist: jest.fn(),
    };
}

describe('전화번호 화이트리스트 수정 유스케이스', () => {
    it('존재하는 항목을 수정하고 결과를 반환한다', async () => {
        const updatedItem = { ...existingItem, description: '새 설명', isActive: false };
        const useCase = new UpdatePhoneWhitelistUseCase(
            makeReader(existingItem),
            makeWriter(updatedItem),
            new UserAdminCommandPolicyService(),
            new UserAdminPhoneWhitelistResultMapperService(),
        );

        const result = await useCase.execute('wl-1', { description: '새 설명', isActive: false });

        expect(result.description).toBe('새 설명');
        expect(result.isActive).toBe(false);
    });

    it('존재하지 않는 항목이면 DomainValidationError를 던진다', async () => {
        const useCase = new UpdatePhoneWhitelistUseCase(
            makeReader(null),
            makeWriter(null),
            new UserAdminCommandPolicyService(),
            new UserAdminPhoneWhitelistResultMapperService(),
        );

        await expect(useCase.execute('not-found', {})).rejects.toBeInstanceOf(DomainValidationError);
    });
});
