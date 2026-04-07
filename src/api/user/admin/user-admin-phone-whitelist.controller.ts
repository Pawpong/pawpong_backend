import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { UserAdminProtectedController } from './decorator/user-admin-controller.decorator';
import { AddPhoneWhitelistUseCase } from './application/use-cases/add-phone-whitelist.use-case';
import { DeletePhoneWhitelistUseCase } from './application/use-cases/delete-phone-whitelist.use-case';
import { GetPhoneWhitelistUseCase } from './application/use-cases/get-phone-whitelist.use-case';
import { UpdatePhoneWhitelistUseCase } from './application/use-cases/update-phone-whitelist.use-case';
import { AddPhoneWhitelistRequestDto, UpdatePhoneWhitelistRequestDto } from './dto/request/phone-whitelist-request.dto';
import { PhoneWhitelistListResponseDto, PhoneWhitelistResponseDto } from './dto/response/phone-whitelist-response.dto';
import {
    ApiAddPhoneWhitelistAdminEndpoint,
    ApiDeletePhoneWhitelistAdminEndpoint,
    ApiGetPhoneWhitelistAdminEndpoint,
    ApiUpdatePhoneWhitelistAdminEndpoint,
} from './swagger';

@UserAdminProtectedController()
export class UserAdminPhoneWhitelistController {
    constructor(
        private readonly getPhoneWhitelistUseCase: GetPhoneWhitelistUseCase,
        private readonly addPhoneWhitelistUseCase: AddPhoneWhitelistUseCase,
        private readonly updatePhoneWhitelistUseCase: UpdatePhoneWhitelistUseCase,
        private readonly deletePhoneWhitelistUseCase: DeletePhoneWhitelistUseCase,
    ) {}

    @Get('phone-whitelist')
    @ApiGetPhoneWhitelistAdminEndpoint()
    async getPhoneWhitelist(): Promise<ApiResponseDto<PhoneWhitelistListResponseDto>> {
        const result = await this.getPhoneWhitelistUseCase.execute();
        return ApiResponseDto.success(result, '화이트리스트가 조회되었습니다.');
    }

    @Post('phone-whitelist')
    @ApiAddPhoneWhitelistAdminEndpoint()
    async addPhoneWhitelist(
        @CurrentUser('userId') adminId: string,
        @Body() dto: AddPhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.addPhoneWhitelistUseCase.execute(adminId, dto);
        return ApiResponseDto.success(result, '화이트리스트에 추가되었습니다.');
    }

    @Patch('phone-whitelist/:id')
    @ApiUpdatePhoneWhitelistAdminEndpoint()
    async updatePhoneWhitelist(
        @Param('id') id: string,
        @Body() dto: UpdatePhoneWhitelistRequestDto,
    ): Promise<ApiResponseDto<PhoneWhitelistResponseDto>> {
        const result = await this.updatePhoneWhitelistUseCase.execute(id, dto);
        return ApiResponseDto.success(result, '화이트리스트가 수정되었습니다.');
    }

    @Delete('phone-whitelist/:id')
    @ApiDeletePhoneWhitelistAdminEndpoint()
    async deletePhoneWhitelist(@Param('id') id: string): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.deletePhoneWhitelistUseCase.execute(id);
        return ApiResponseDto.success(result, result.message);
    }
}
