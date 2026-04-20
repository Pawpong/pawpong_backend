import { Controller, applyDecorators } from '@nestjs/common';

import { ApiBreedAdminController } from '../swagger';

export function BreedAdminControllerBase() {
    return applyDecorators(ApiBreedAdminController(), Controller('breeds-admin'));
}
