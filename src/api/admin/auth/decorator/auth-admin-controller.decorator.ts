import { Controller, applyDecorators } from '@nestjs/common';

import { ApiAuthAdminController } from '../swagger/index';

export function AuthAdminControllerBase() {
    return applyDecorators(ApiAuthAdminController(), Controller('auth-admin'));
}
