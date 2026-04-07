import { applyDecorators, Controller, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { ApiInquiryController } from '../swagger';

export function InquiryPublicController() {
    return applyDecorators(ApiInquiryController(), Controller('inquiry'));
}

export function InquiryProtectedController(role: 'adopter' | 'breeder') {
    return applyDecorators(
        ApiInquiryController(),
        Controller('inquiry'),
        UseGuards(JwtAuthGuard, RolesGuard),
        Roles(role),
    );
}
