import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { RequestWithUser } from '../types/authenticated-request-user.type';

/**
 * 현재 인증된 사용자 정보를 추출하는 데코레이터
 * JWT 토큰에서 추출한 사용자 정보를 컨트롤러 메서드에 주입합니다.
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (typeof data === 'string' && user) {
        return user[data];
    }

    return user;
});
