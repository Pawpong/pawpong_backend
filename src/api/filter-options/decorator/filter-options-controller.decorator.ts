import { Controller, applyDecorators } from '@nestjs/common';

import { ApiFilterOptionsController } from '../swagger';

export function FilterOptionsController() {
    return applyDecorators(ApiFilterOptionsController(), Controller('filter-options'));
}
