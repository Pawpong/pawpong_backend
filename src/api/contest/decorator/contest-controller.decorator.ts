import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { ApiContestProtectedController, ApiContestPublicController } from '../swagger';

export function ContestPublicController() {
    return applyDecorators(ApiContestPublicController(), Controller('v2/contest'), UseGuards(OptionalJwtAuthGuard));
}

export function ContestProtectedController() {
    return applyDecorators(ApiContestProtectedController(), Controller('v2/contest'), UseGuards(JwtAuthGuard));
}
