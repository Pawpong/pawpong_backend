import { Get } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { GetAdminProfileUseCase } from './application/use-cases/get-admin-profile.use-case';
import { AdminProfileResponseDto } from './dto/response/admin-profile-response.dto';
import { ApiGetUserAdminProfileEndpoint } from './swagger';

@UserAdminProtectedController()
export class UserAdminProfileController {
    constructor(private readonly getAdminProfileUseCase: GetAdminProfileUseCase) {}

    @Get('profile')
    @ApiGetUserAdminProfileEndpoint()
    async getProfile(@CurrentUser('userId') adminId: string): Promise<ApiResponseDto<AdminProfileResponseDto>> {
        const result = await this.getAdminProfileUseCase.execute(adminId);
        return ApiResponseDto.success(result, '관리자 프로필이 조회되었습니다.');
    }
}
