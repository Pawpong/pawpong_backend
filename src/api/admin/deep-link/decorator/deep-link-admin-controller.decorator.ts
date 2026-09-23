import { applyDecorators, Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';

/** 링크 발행·조회·변경은 관리자 JWT만 허용한다. */
export const DeepLinkAdminController = () =>
    applyDecorators(
        Controller('deep-link-admin'),
        ApiTags('공유 링크 관리 (Admin)'),
        ApiBearerAuth('JWT-Auth'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles('admin'),
    );
