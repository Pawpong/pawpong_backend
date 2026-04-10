import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { UserSearchRequestDto } from './dto/request/user-search-request.dto';
import { UserManagementResponseDto } from './dto/response/user-management-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './constants/user-admin-response-messages';
import { ApiGetUsersAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminUsersListController {
    constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

    @Get('users')
    @ApiGetUsersAdminEndpoint()
    async getUsers(
        @CurrentUser('userId') adminId: string,
        @Query() filter: UserSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<UserManagementResponseDto>>> {
        const result = await this.getUsersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            USER_ADMIN_RESPONSE_MESSAGES.usersRetrieved,
        );
    }
}
