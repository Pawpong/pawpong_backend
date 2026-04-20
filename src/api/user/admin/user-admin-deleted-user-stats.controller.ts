import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetDeletedUserStatsUseCase } from './application/use-cases/get-deleted-user-stats.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { DeletedUserStatsResponseDto } from './dto/response/deleted-user-stats-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './constants/user-admin-response-messages';
import { ApiGetDeletedUserStatsAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminDeletedUserStatsController {
    constructor(private readonly getDeletedUserStatsUseCase: GetDeletedUserStatsUseCase) {}

    @Get('deleted-users/stats')
    @ApiGetDeletedUserStatsAdminEndpoint()
    async getDeletedUserStats(@CurrentUser('userId') adminId: string): Promise<ApiResponseDto<DeletedUserStatsResponseDto>> {
        const result = await this.getDeletedUserStatsUseCase.execute(adminId);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.deletedUserStatsRetrieved);
    }
}
