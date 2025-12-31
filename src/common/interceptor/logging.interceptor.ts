import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

import { CustomLoggerService } from '../logger/custom-logger.service';

/**
 * HTTP 요청 로깅 인터셉터
 * Winston 로거를 사용하여 모든 HTTP 요청 정보를 로그로 기록합니다.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: CustomLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType() !== 'http') {
            return next.handle();
        }

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        const { method, url, ip, headers, cookies, body } = request;

        // 요청 헤더 로깅
        this.logger.log(``, 'HTTP');
        this.logger.log(`▶ ${method} ${url}`, 'HTTP');
        this.logger.log(`  ├─ IP: ${ip}`, 'HTTP');

        // Bearer 토큰
        if (headers.authorization?.startsWith('Bearer ')) {
            const token = headers.authorization.substring(7);
            this.logger.log(`  ├─ Token: ${token}`, 'HTTP');
        }

        // 쿠키 역할
        if (cookies?.userRole) {
            this.logger.log(`  ├─ Role: ${cookies.userRole}`, 'HTTP');
        }

        // Body 로깅 (POST, PUT, PATCH만)
        if (['POST', 'PUT', 'PATCH'].includes(method) && body && Object.keys(body).length > 0) {
            const safeBody = { ...body };
            if (safeBody.password) safeBody.password = '***';
            if (safeBody.refreshToken) safeBody.refreshToken = safeBody.refreshToken.substring(0, 20) + '...';
            this.logger.log(`  └─ Body: ${JSON.stringify(safeBody)}`, 'HTTP');
        } else {
            this.logger.log(`  └─ Body: (none)`, 'HTTP');
        }

        // 응답은 로깅하지 않음 (사용자 요청)
        return next.handle();
    }
}
