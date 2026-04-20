import { Controller, applyDecorators } from '@nestjs/common';

import { ApiAuthAdminController } from '../swagger';

export function AuthAdminControllerBase() {
    return applyDecorators(ApiAuthAdminController(), Controller('auth-admin'));
}
