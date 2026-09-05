import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiAiImageAdminController } from '../swagger/index';

/**
 * AI 이미지 관리자 컨트롤러.
 * 레포 컨벤션대로 admin 라우트에는 v2 접두사를 붙이지 않는다.
 */
export function AiImageAdminController() {
    return applyDecorators(
        ApiAiImageAdminController(),
        Controller('ai-image-admin'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
}
