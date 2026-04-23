import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { AuthSocialCallbackFlowResult } from '../../application/types/auth-social-callback-flow.type';
import { AuthHttpCookieService } from '../services/auth-http-cookie.service';
import { AuthSocialCallbackResultFactoryService } from '../services/auth-social-callback-result-factory.service';

@Injectable()
export class AuthSocialCallbackResponseInterceptor implements NestInterceptor<AuthSocialCallbackFlowResult, void> {
    constructor(
        private readonly authHttpCookieService: AuthHttpCookieService,
        private readonly authSocialCallbackResultFactoryService: AuthSocialCallbackResultFactoryService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<AuthSocialCallbackFlowResult>): Observable<void> {
        const response = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((result) => {
                const callbackResult = this.authSocialCallbackResultFactoryService.create(result);
                this.authHttpCookieService.applyCookies(response, callbackResult.cookies);
                response.redirect(callbackResult.redirectUrl);
            }),
        );
    }
}
