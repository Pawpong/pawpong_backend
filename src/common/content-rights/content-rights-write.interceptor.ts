import { CallHandler, ExecutionContext, ForbiddenException, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Observable } from 'rxjs';
import type { RequestWithUser } from '../types/authenticated-request-user.type';
import { CONTENT_RIGHTS_REQUIRED } from './require-content-rights.decorator';
import { isAppVisibleAccount, isIosAppRequest } from './app-request-context';

@Injectable()
export class ContentRightsWriteInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        if (!isIosAppRequest() || !this.reflector.get<boolean>(CONTENT_RIGHTS_REQUIRED, context.getHandler())) {
            return next.handle();
        }
        const user = context.switchToHttp().getRequest<RequestWithUser>().user;
        if (!user || (user.role !== 'adopter' && user.role !== 'breeder') ||
            !(await isAppVisibleAccount(this.connection, user.role, user.userId))) {
            throw new ForbiddenException('게시물 앱 표시 동의가 필요합니다. 설정에서 동의한 뒤 다시 시도해 주세요.');
        }
        return next.handle();
    }
}
