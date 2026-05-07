import { Controller, applyDecorators } from '@nestjs/common';

import { ApiPopularKeywordAdminController } from '../swagger';

export function PopularKeywordAdminControllerBase() {
    return applyDecorators(ApiPopularKeywordAdminController(), Controller('popular-keyword-admin'));
}
