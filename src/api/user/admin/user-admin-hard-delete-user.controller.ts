import { Param, Patch, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { HardDeleteUserUseCase } from './application/use-cases/hard-delete-user.use-case';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { ApiHardDeleteUserAdminEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminHardDeleteUserController {
    constructor(private readonly hardDeleteUserUseCase: HardDeleteUserUseCase) {}

    @Patch('users/:userId/hard-delete')
    @Roles('super_admin')
    @ApiHardDeleteUserAdminEndpoint()
    async hardDeleteUser(
        @CurrentUser('userId') adminId: string,
        @Param('userId') userId: string,
        @Query('role') role: 'adopter' | 'breeder',
    ): Promise<ApiResponseDto<any>> {
        const result = await this.hardDeleteUserUseCase.execute(adminId, userId, role);
        return ApiResponseDto.success(result, '사용자가 영구적으로 삭제되었습니다.');
    }
}
