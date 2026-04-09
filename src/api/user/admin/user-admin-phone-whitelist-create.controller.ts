import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { AddPhoneWhitelistUseCase } from './application/use-cases/add-phone-whitelist.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { AddPhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistResponseDto } from './dto/response/phone-whitelist-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './domain/services/user-admin-response-message.service';
import { ApiAddPhoneWhitelistAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminPhoneWhitelistCreateController {
    constructor(private readonly addPhoneWhitelistUseCase: AddPhoneWhitelistUseCase) {}

    @Post('phone-whitelist')
    @ApiAddPhoneWhitelistAdminEndpoint()
    async addPhoneWhitelist(
        @CurrentUser('userId') adminId: string,
        @Body() dto: AddPhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.addPhoneWhitelistUseCase.execute(adminId, dto);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistCreated);
    }
}
