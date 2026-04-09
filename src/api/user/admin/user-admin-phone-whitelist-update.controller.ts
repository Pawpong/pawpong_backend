import { Body, Param, Patch } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { UpdatePhoneWhitelistUseCase } from './application/use-cases/update-phone-whitelist.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { UpdatePhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistResponseDto } from './dto/response/phone-whitelist-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './domain/services/user-admin-response-message.service';
import { ApiUpdatePhoneWhitelistAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminPhoneWhitelistUpdateController {
    constructor(private readonly updatePhoneWhitelistUseCase: UpdatePhoneWhitelistUseCase) {}

    @Patch('phone-whitelist/:id')
    @ApiUpdatePhoneWhitelistAdminEndpoint()
    async updatePhoneWhitelist(
        @Param('id') id: string,
        @Body() dto: UpdatePhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.updatePhoneWhitelistUseCase.execute(id, dto);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistUpdated);
    }
}
