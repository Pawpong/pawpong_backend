import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthHttpCookieService } from '../services/auth-http-cookie.service';

@Injectable()
export class AuthLogoutCookieInterceptor implements NestInterceptor {
    constructor(private readonly authHttpCookieService: AuthHttpCookieService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const response = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((data) => {
                this.authHttpCookieService.clearAuthCookies(response);
                return data;
            }),
        );
    }
}
