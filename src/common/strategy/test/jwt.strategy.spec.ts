import { DomainAuthenticationError } from '../../../common/error/domain.error';
import { JwtStrategy } from '../../../common/strategy/jwt.strategy';
import type { JwtUserStatusPort } from '../../../common/strategy/ports/jwt-user-status.port';

describe('JwtStrategy', () => {
    const createStrategy = (userStatusPort: jest.Mocked<JwtUserStatusPort>) => {
        const configService = {
            get: jest.fn().mockReturnValue('jwt-secret'),
        };

        return new JwtStrategy(configService as never, userStatusPort);
    };

    it.each(['adopter', 'breeder'] as const)('정지한 %s의 기존 access token을 거절한다', async (role) => {
        const strategy = createStrategy({ findAccountStatus: jest.fn().mockResolvedValue('suspended') });
        await expect(strategy.validate({ sub: 'user-id', email: 'user@example.test', role })).rejects.toThrow(
            DomainAuthenticationError,
        );
    });

    it('탈퇴한 adopter는 DomainAuthenticationError를 던진다', async () => {
        const userStatusPort: jest.Mocked<JwtUserStatusPort> = {
            findAccountStatus: jest.fn().mockResolvedValue('deleted'),
        };
        const strategy = createStrategy(userStatusPort);

        await expect(
            strategy.validate({
                sub: 'adopter-id',
                email: 'adopter@test.com',
                role: 'adopter',
            }),
        ).rejects.toThrow(new DomainAuthenticationError('이미 탈퇴된 계정입니다.'));

        expect(userStatusPort.findAccountStatus).toHaveBeenCalledWith('adopter-id', 'adopter');
    });

    it('토큰의 사용자 계정이 없으면 인증 실패로 처리한다', async () => {
        const userStatusPort: jest.Mocked<JwtUserStatusPort> = {
            findAccountStatus: jest.fn().mockResolvedValue(undefined),
        };
        const strategy = createStrategy(userStatusPort);

        await expect(
            strategy.validate({
                sub: 'missing-id',
                email: 'missing@test.com',
                role: 'breeder',
            }),
        ).rejects.toThrow(new DomainAuthenticationError('인증된 사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.'));
    });

    it('정상 breeder는 인증 사용자 정보를 반환한다', async () => {
        const userStatusPort: jest.Mocked<JwtUserStatusPort> = {
            findAccountStatus: jest.fn().mockResolvedValue('active'),
        };
        const strategy = createStrategy(userStatusPort);

        await expect(
            strategy.validate({
                sub: 'breeder-id',
                email: 'breeder@test.com',
                role: 'breeder',
                adminLevel: undefined,
            }),
        ).resolves.toEqual({
            userId: 'breeder-id',
            email: 'breeder@test.com',
            role: 'breeder',
            adminLevel: undefined,
        });
    });
});
