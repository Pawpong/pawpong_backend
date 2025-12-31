import { ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

/**
 * JWT 인증 가드
 * JWT 토큰 검증 실패 시 상세한 에러 처리를 제공합니다.
 * @Public() 데코레이터가 적용된 엔드포인트는 인증을 건너뜁니다.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger('Auth');

    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // @Public() 데코레이터가 있는지 확인
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        // 에러가 있거나 user가 없으면 인증 실패
        if (err || !user) {
            if (info) {
                if (info.name === 'TokenExpiredError') {
                    throw new UnauthorizedException('토큰이 만료되었습니다. 다시 로그인해주세요.');
                } else if (info.name === 'JsonWebTokenError') {
                    throw new UnauthorizedException('유효하지 않은 토큰입니다.');
                } else if (info.name === 'NotBeforeError') {
                    throw new UnauthorizedException('토큰이 아직 유효하지 않습니다.');
                } else if (info.message === 'No auth token') {
                    throw new UnauthorizedException('인증 토큰이 필요합니다.');
                }
            }

            if (err) {
                throw err;
            }

            throw new UnauthorizedException('인증에 실패했습니다.');
        }

        return user;
    }
}
