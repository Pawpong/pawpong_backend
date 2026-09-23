import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { from, lastValueFrom, type Observable } from 'rxjs';
import { AccountWriteFenceService } from './account-write-fence.service';

@Injectable()
export class AccountWriteFenceInterceptor implements NestInterceptor {
    constructor(private readonly fence: AccountWriteFenceService) {}

    /** 인증이 끝난 서비스 사용자 mutation만 감싼다. 삭제 접수 자체는 쓰기 종료를 기다리는 별도 경로다. */
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType() !== 'http') return next.handle();
        const request = context.switchToHttp().getRequest<Request & { user?: { userId?: string; role?: string } }>();
        const method = request.method.toUpperCase();
        const role = request.user?.role;
        const accountId = request.user?.userId;
        const path = (request.originalUrl || request.url).split('?')[0];
        if (
            !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ||
            !accountId ||
            (role !== 'adopter' && role !== 'breeder') ||
            /^\/(?:api\/)?v2\/account-deletion(?:\/|$)/.test(path)
        ) {
            return next.handle();
        }
        // from(Promise)의 바깥 구독이 취소되어도 내부 lastValueFrom 구독은 유지된다.
        // finalize에서 lease를 풀면 client abort 뒤에도 살아 있는 async handler와 삭제가 경쟁한다.
        return from(
            this.fence.runWithLease({ accountId, role, operation: `http:${method}` }, () =>
                lastValueFrom(next.handle(), { defaultValue: undefined }),
            ),
        );
    }
}
