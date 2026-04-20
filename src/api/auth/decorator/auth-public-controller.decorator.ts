import { applyDecorators, Controller } from '@nestjs/common';

import { ApiAuthController } from '../swagger';

export function AuthPublicController() {
    return applyDecorators(ApiAuthController(), Controller('auth'));
}
