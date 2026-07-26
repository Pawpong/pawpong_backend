import { GetPhoneWhitelistUseCase } from '../../../application/use-cases/get-phone-whitelist.use-case';
import { UserAdminPhoneWhitelistResultMapperService } from '../../../domain/services/user-admin-phone-whitelist-result-mapper.service';
import {
    UserAdminReaderPort,
    UserAdminPhoneWhitelistSnapshot,
} from '../../../application/ports/user-admin-reader.port';

function makeReader(items: UserAdminPhoneWhitelistSnapshot[] = []): UserAdminReaderPort {
    return {
        findAdminById: jest.fn(),
        getUsers: jest.fn(),
        findManagedUserById: jest.fn(),
        getDeletedUsers: jest.fn(),
        getDeletedUserStats: jest.fn(),
        listPhoneWhitelist: jest.fn().mockResolvedValue(items),
        findPhoneWhitelistById: jest.fn(),
        findPhoneWhitelistByPhoneNumber: jest.fn(),
    };
}

function makeWhitelistItem(overrides: Partial<UserAdminPhoneWhitelistSnapshot> = {}): UserAdminPhoneWhitelistSnapshot {
    return {
        id: 'wl-1',
        phoneNumber: '01012345678',
        description: '테스트 계정',
        isActive: true,
        createdBy: 'admin-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

describe('전화번호 화이트리스트 목록 조회 유스케이스', () => {
    it('화이트리스트 목록을 반환한다', async () => {
        const useCase = new GetPhoneWhitelistUseCase(
            makeReader([makeWhitelistItem(), makeWhitelistItem({ id: 'wl-2', phoneNumber: '01087654321' })]),
            new UserAdminPhoneWhitelistResultMapperService(),
        );

        const result = await useCase.execute();

        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    it('목록이 없으면 빈 배열을 반환한다', async () => {
        const useCase = new GetPhoneWhitelistUseCase(makeReader([]), new UserAdminPhoneWhitelistResultMapperService());

        const result = await useCase.execute();

        expect(result.items).toEqual([]);
        expect(result.total).toBe(0);
    });
});
