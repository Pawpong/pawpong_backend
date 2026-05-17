import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { OptionalJwtAuthGuard } from '../../../../common/guard/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { ApiFeedVideoController } from '../swagger';

export function FeedPublicController() {
    return applyDecorators(ApiFeedVideoController(), Controller('v2/feed'));
}

export function FeedProtectedController() {
    return applyDecorators(ApiFeedVideoController(), Controller('v2/feed'), UseGuards(JwtAuthGuard));
}

export function FeedOptionalAuthController() {
    return applyDecorators(ApiFeedVideoController(), Controller('v2/feed'), UseGuards(OptionalJwtAuthGuard));
}
