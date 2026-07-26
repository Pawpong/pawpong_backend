import { Controller, applyDecorators } from '@nestjs/common';

import { ApiDistrictController } from '../swagger/index';

export function DistrictPublicController() {
    return applyDecorators(ApiDistrictController(), Controller('v2/districts'));
}
