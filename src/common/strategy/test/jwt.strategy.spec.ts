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
