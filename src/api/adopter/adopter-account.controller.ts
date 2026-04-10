import { Body, Delete } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteAdopterAccountUseCase } from './application/use-cases/delete-adopter-account.use-case';
import type { AdopterAccountDeleteResult } from './application/types/adopter-result.type';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { AccountDeleteRequestDto } from './dto/request/account-delete-request.dto';
import { AccountDeleteResponseDto } from './dto/response/account-delete-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './domain/services/adopter-response-message.service';
import { ApiDeleteAdopterAccountEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterAccountController {
    constructor(private readonly deleteAdopterAccountUseCase: DeleteAdopterAccountUseCase) {}

    @Delete('account')
    @ApiDeleteAdopterAccountEndpoint()
    async deleteAccount(
        @CurrentUser('userId') userId: string,
        @Body() deleteData: AccountDeleteRequestDto,
    ): Promise<ApiResponseDto<AccountDeleteResponseDto>> {
        const result = await this.deleteAdopterAccountUseCase.execute(userId, deleteData);
        return ApiResponseDto.success(
            result as AccountDeleteResponseDto & AdopterAccountDeleteResult,
            ADOPTER_RESPONSE_MESSAGES.accountDeleted,
        );
    }
}
