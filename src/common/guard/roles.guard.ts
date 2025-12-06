import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        console.log('[RolesGuard] requiredRoles:', requiredRoles);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        console.log('[RolesGuard] user:', JSON.stringify(user));
        console.log('[RolesGuard] user.role:', user?.role);

        // 브리더도 adopter 권한의 API 사용 가능 (찜하기 등)
        const effectiveRoles = [user?.role];
        if (user?.role === 'breeder') {
            effectiveRoles.push('adopter');
        }

        const hasRole = requiredRoles.some((role) => effectiveRoles.includes(role));
        console.log('[RolesGuard] effectiveRoles:', effectiveRoles, 'hasRole:', hasRole);
        return hasRole;
    }
}
