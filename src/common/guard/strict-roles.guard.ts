import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 엄격한 역할 검증 가드.
 *
 * 표준 RolesGuard 는 v1 호환성을 위해 brand 가 adopter 권한 API 도 사용할 수 있도록
 * 'breeder' 사용자에게 'adopter' 권한을 자동 부여한다.
 * v2 (예: 입양 페이지 동물 단위 즐겨찾기 토글)에서는 이 fallback 이 의도하지 않은 권한 누출이 되므로,
 * 본 가드는 user.role 이 metadata 의 roles 배열에 정확히 포함되어 있을 때만 통과시킨다.
 *
 * admin role 은 admin 전용 API 검증을 위해 그대로 통과시키되 brand → adopter 같은 자동 확장은 하지 않는다.
 */
@Injectable()
export class StrictRolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const role = user?.role;

        if (!role || !requiredRoles.includes(role)) {
            throw new ForbiddenException('해당 작업을 수행할 권한이 없습니다.');
        }

        return true;
    }
}
