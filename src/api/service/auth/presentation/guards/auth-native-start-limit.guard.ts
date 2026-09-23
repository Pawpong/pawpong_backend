import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_NATIVE_SESSION_PORT, type AuthNativeSessionPort } from '../../application/ports/auth-native-session.port';
import { nativeAuthClientAddress } from '../services/auth-native-client-address';

/** 인증 state 발급량을 공유 Redis에서 IP당 10분 30회로 제한한다. */
@Injectable()
export class AuthNativeStartLimitGuard implements CanActivate {
    constructor(@Inject(AUTH_NATIVE_SESSION_PORT) private readonly sessions: AuthNativeSessionPort) {}

    /** 헤더를 직접 인덱싱하지 않고 명시적인 trusted-hop 경계로 요청 IP를 계산한다. */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        if (!(await this.sessions.allowStart(nativeAuthClientAddress(request)))) {
            throw new HttpException('로그인 시도가 많습니다. 잠시 후 다시 시도해주세요.', HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
}
