import { Reflector } from '@nestjs/core';

import { DomainAuthenticationError } from '../../../common/error/domain.error';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

describe('JwtAuthGuard', () => {
    const createGuard = () => {
        const reflector = {
            getAllAndOverride: jest.fn(),
        } as unknown as Reflector;

        return new JwtAuthGuard(reflector);
    };

    it('만료된 토큰이면 DomainAuthenticationError를 던진다', () => {
        const guard = createGuard();

        expect(() => guard.handleRequest(undefined, null, { name: 'TokenExpiredError' }, {} as never)).toThrow(
            new DomainAuthenticationError('토큰이 만료되었습니다. 다시 로그인해주세요.'),
        );
    });

    it('토큰이 없으면 DomainAuthenticationError를 던진다', () => {
        const guard = createGuard();

        expect(() => guard.handleRequest(undefined, null, { message: 'No auth token' }, {} as never)).toThrow(
            new DomainAuthenticationError('인증 토큰이 필요합니다.'),
        );
    });

    it('인증된 사용자는 그대로 반환한다', () => {
        const guard = createGuard();
        const user = {
            userId: 'user-id',
            email: 'user@test.com',
            role: 'adopter',
        };

        expect(guard.handleRequest(undefined, user, undefined, {} as never)).toBe(user);
    });
});
