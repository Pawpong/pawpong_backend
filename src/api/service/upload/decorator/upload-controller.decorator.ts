import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { ApiUploadController } from '../swagger/index';

export function UploadController() {
    return applyDecorators(ApiUploadController(), Controller('v2/upload'));
}

export function ProtectedUploadController() {
    return applyDecorators(UploadController(), UseGuards(JwtAuthGuard));
}
