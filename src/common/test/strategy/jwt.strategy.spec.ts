import { DomainAuthenticationError } from '../../../common/error/domain.error';
import { JwtStrategy } from '../../../common/strategy/jwt.strategy';

describe('JwtStrategy', () => {
    const createFindByIdQuery = (value: unknown) => ({
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(value),
            }),
        }),
    });

    const createStrategy = () => {
        const configService = {
            get: jest.fn().mockReturnValue('jwt-secret'),
        };
        const adopterModel = {
            findById: jest.fn(),
        };
        const breederModel = {
            findById: jest.fn(),
        };

        const strategy = new JwtStrategy(configService as never, adopterModel as never, breederModel as never);

        return {
            strategy,
            adopterModel,
            breederModel,
        };
    };

    it('탈퇴한 adopter는 DomainAuthenticationError를 던진다', async () => {
        const { strategy, adopterModel } = createStrategy();
        adopterModel.findById.mockReturnValue(
            createFindByIdQuery({
                accountStatus: 'deleted',
            }),
        );

        await expect(
            strategy.validate({
                sub: 'adopter-id',
                email: 'adopter@test.com',
                role: 'adopter',
            }),
        ).rejects.toThrow(new DomainAuthenticationError('이미 탈퇴된 계정입니다.'));
    });

    it('정상 breeder는 인증 사용자 정보를 반환한다', async () => {
        const { strategy, breederModel } = createStrategy();
        breederModel.findById.mockReturnValue(
            createFindByIdQuery({
                accountStatus: 'active',
            }),
        );

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
