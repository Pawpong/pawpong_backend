import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';

import { BreederLevelAdminService } from './breeder-level-admin.service';
import { BreederLevelChangeRequestDto } from './dto/request/breeder-level-change-request.dto';
import { BreederLevelChangeResponseDto } from './dto/response/breeder-level-change-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';

/**
 * 브리더 레벨 관리 Admin 컨트롤러
 *
 * 관리자가 브리더 레벨을 관리하는 API를 제공합니다.
 */
@ApiController('브리더 레벨 관리 (Admin)')
@Controller('breeder-level-admin')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreederLevelAdminController {
    constructor(private readonly breederLevelAdminService: BreederLevelAdminService) {}

    @Patch('level/:breederId')
    @ApiEndpoint({
        summary: '브리더 레벨 변경',
        description: '승인된 브리더의 레벨을 뉴 ↔ 엘리트로 변경합니다.',
        responseType: BreederLevelChangeResponseDto,
        isPublic: false,
    })
    async changeBreederLevel(
        @CurrentUser() user: any,
        @Param('breederId') breederId: string,
        @Body() levelData: BreederLevelChangeRequestDto,
    ): Promise<ApiResponseDto<BreederLevelChangeResponseDto>> {
        const result = await this.breederLevelAdminService.changeBreederLevel(user.userId, breederId, levelData);
        return ApiResponseDto.success(result, '브리더 레벨이 변경되었습니다.');
    }
}
