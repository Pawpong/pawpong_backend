import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiStandardQuestionAdminController } from '../swagger';

export function StandardQuestionAdminProtectedController() {
    return applyDecorators(
        ApiStandardQuestionAdminController(),
        Controller('standard-question-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
