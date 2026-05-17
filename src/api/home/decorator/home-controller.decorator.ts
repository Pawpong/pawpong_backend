import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { ApiHomeController } from '../swagger';

export function HomePublicController() {
    return applyDecorators(ApiHomeController(), Controller('v2/home'));
}

export function HomeOptionalAuthController() {
    return applyDecorators(ApiHomeController(), Controller('v2/home'), UseGuards(OptionalJwtAuthGuard));
}
