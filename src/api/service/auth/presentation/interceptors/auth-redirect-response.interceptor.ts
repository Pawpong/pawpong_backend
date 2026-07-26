import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthRedirectResponseInterceptor implements NestInterceptor<string, void> {
    intercept(context: ExecutionContext, next: CallHandler<string>): Observable<void> {
        const response = context.switchToHttp().getResponse<Response>();

        return next.handle().pipe(
            map((redirectUrl) => {
                response.redirect(redirectUrl);
            }),
        );
    }
}
