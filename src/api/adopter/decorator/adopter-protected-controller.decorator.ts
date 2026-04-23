import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { ApiAdopterController } from '../swagger';

export function AdopterProtectedController() {
    return applyDecorators(
        ApiAdopterController(),
        Controller('adopter'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('adopter'),
    );
}
