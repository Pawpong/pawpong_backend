import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';

export function ContestPublicController() {
    return applyDecorators(Controller('v2/contest'), UseGuards(OptionalJwtAuthGuard));
}

export function ContestProtectedController() {
    return applyDecorators(Controller('v2/contest'), UseGuards(JwtAuthGuard));
}
