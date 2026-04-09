import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetPhoneWhitelistUseCase } from './application/use-cases/get-phone-whitelist.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { PhoneWhitelistListResponseDto } from './dto/response/phone-whitelist-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './constants/user-admin-response-messages';
import { ApiGetPhoneWhitelistAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminPhoneWhitelistListController {
    constructor(private readonly getPhoneWhitelistUseCase: GetPhoneWhitelistUseCase) {}

    @Get('phone-whitelist')
    @ApiGetPhoneWhitelistAdminEndpoint()
    async getPhoneWhitelist(): Promise<ApiResponseDto<PhoneWhitelistListResponseDto>> {
        const result = await this.getPhoneWhitelistUseCase.execute();
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.phoneWhitelistRetrieved);
    }
}
