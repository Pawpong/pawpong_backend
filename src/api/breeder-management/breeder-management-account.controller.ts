import { Body, Delete } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { DeleteBreederManagementAccountUseCase } from './application/use-cases/delete-breeder-management-account.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './constants/breeder-management-response-messages';
import { BreederAccountDeleteRequestDto } from './dto/request/breeder-account-delete-request.dto';
import { BreederAccountDeleteResponseDto } from './dto/response/breeder-account-delete-response.dto';
import { ApiDeleteBreederManagementAccountEndpoint } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementAccountController {
    constructor(private readonly deleteBreederManagementAccountUseCase: DeleteBreederManagementAccountUseCase) {}

    @Delete('account')
    @ApiDeleteBreederManagementAccountEndpoint()
    async deleteAccount(
        @CurrentUser('userId') userId: string,
        @Body() deleteData?: BreederAccountDeleteRequestDto,
    ): Promise<ApiResponseDto<BreederAccountDeleteResponseDto>> {
        const result = await this.deleteBreederManagementAccountUseCase.execute(userId, deleteData);
        return ApiResponseDto.success(result, BREEDER_MANAGEMENT_RESPONSE_MESSAGES.accountDeleted);
    }
}
