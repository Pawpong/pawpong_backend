import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetDeletedUsersUseCase } from './application/use-cases/get-deleted-users.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { DeletedUserSearchRequestDto } from './dto/request/deleted-user-search-request.dto';
import { DeletedUserResponseDto } from './dto/response/deleted-user-response.dto';
import { USER_ADMIN_RESPONSE_MESSAGES } from './domain/services/user-admin-response-message.service';
import { ApiGetDeletedUsersAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminDeletedUsersListController {
    constructor(private readonly getDeletedUsersUseCase: GetDeletedUsersUseCase) {}

    @Get('deleted-users')
    @ApiGetDeletedUsersAdminEndpoint()
    async getDeletedUsers(
        @CurrentUser('userId') adminId: string,
        @Query() filter: DeletedUserSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<DeletedUserResponseDto>>> {
        const result = await this.getDeletedUsersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, USER_ADMIN_RESPONSE_MESSAGES.deletedUsersRetrieved);
    }
}
