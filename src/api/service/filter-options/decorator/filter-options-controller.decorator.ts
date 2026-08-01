import { Controller, applyDecorators } from '@nestjs/common';

import { ApiFilterOptionsController } from '../swagger/index';

export function FilterOptionsController() {
    return applyDecorators(ApiFilterOptionsController(), Controller('v2/filter-options'));
}
