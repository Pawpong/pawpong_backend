import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { map, type Observable } from 'rxjs';

import type { AuthSocialCallbackFlowResult } from '../../application/types/auth-social-callback-flow.type';
import { AuthSocialCallbackResultFactoryService } from '../services/auth-social-callback-result-factory.service';

/** 앱 복귀 URL과 웹의 기존 콜백 결과를 같은 Google HTTPS 콜백에서 응답한다. */
@Injectable()
export class AuthGoogleCallbackResponseInterceptor implements NestInterceptor<
    AuthSocialCallbackFlowResult | string,
    void
> {
    constructor(private readonly resultFactory: AuthSocialCallbackResultFactoryService) {}

    /** 인증 결과가 브라우저·프록시 캐시에 저장되지 않게 한다. */
    intercept(context: ExecutionContext, next: CallHandler<AuthSocialCallbackFlowResult | string>): Observable<void> {
        const response = context.switchToHttp().getResponse<Response>();
        return next.handle().pipe(
            map((result) => {
                response.setHeader('Cache-Control', 'no-store');
                response.setHeader('Referrer-Policy', 'no-referrer');
                response.redirect(typeof result === 'string' ? result : this.resultFactory.create(result).redirectUrl);
            }),
        );
    }
}
