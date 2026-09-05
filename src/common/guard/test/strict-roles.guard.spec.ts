import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { StrictRolesGuard } from '../strict-roles.guard';

function buildContext(user: { role?: string } | undefined) {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
    } as any;
}

describe('StrictRolesGuard', () => {
    const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    const guard = new StrictRolesGuard(reflector);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('roles metadata 가 없으면 통과', () => {
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
        expect(guard.canActivate(buildContext({ role: 'breeder' }))).toBe(true);
    });

    it('user.role 이 정확히 일치하면 통과', () => {
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['adopter']);
        expect(guard.canActivate(buildContext({ role: 'adopter' }))).toBe(true);
    });

    it('breeder 는 adopter 권한 API 에서 차단된다 (RolesGuard 의 자동 fallback 미적용)', () => {
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['adopter']);
        expect(() => guard.canActivate(buildContext({ role: 'breeder' }))).toThrow(ForbiddenException);
    });

    it('admin 도 metadata 에 포함되어 있지 않으면 차단', () => {
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['adopter']);
        expect(() => guard.canActivate(buildContext({ role: 'admin' }))).toThrow(ForbiddenException);
    });

    it('user 가 없으면 차단', () => {
        (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['adopter']);
        expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
    });
});
