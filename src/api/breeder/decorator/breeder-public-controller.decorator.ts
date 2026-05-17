import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { OptionalJwtAuthGuard } from '../../../common/guard/optional-jwt-auth.guard';
import { ApiBreederController } from '../swagger/decorators';

export function BreederPublicController() {
    return applyDecorators(ApiBreederController(), Controller('v2/breeder'));
}

export function BreederOptionalAuthController() {
    return applyDecorators(ApiBreederController(), Controller('v2/breeder'), UseGuards(OptionalJwtAuthGuard));
}
