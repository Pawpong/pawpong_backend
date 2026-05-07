import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiPopularKeywordAdminController } from '../swagger';

export function PopularKeywordAdminControllerBase() {
    return applyDecorators(
        ApiPopularKeywordAdminController(),
        Controller('popular-keyword-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
