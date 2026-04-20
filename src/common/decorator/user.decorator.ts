import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { RequestWithUser } from '../types/authenticated-request-user.type';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (typeof data === 'string' && user) {
        return user[data];
    }

    return user;
});
