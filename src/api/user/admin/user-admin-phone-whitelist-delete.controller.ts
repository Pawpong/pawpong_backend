import { Delete, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DeletePhoneWhitelistUseCase } from './application/use-cases/delete-phone-whitelist.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { ApiDeletePhoneWhitelistAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminPhoneWhitelistDeleteController {
    constructor(private readonly deletePhoneWhitelistUseCase: DeletePhoneWhitelistUseCase) {}

    @Delete('phone-whitelist/:id')
    @ApiDeletePhoneWhitelistAdminEndpoint()
    async deletePhoneWhitelist(@Param('id') id: string): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.deletePhoneWhitelistUseCase.execute(id);
        return ApiResponseDto.success(result, result.message);
    }
}
