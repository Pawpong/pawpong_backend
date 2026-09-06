import { Body, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { HomeAdminProtectedController } from '../decorator/home-admin-controller.decorator';
import { ManageSupportUseCase } from '../application/use-cases/manage-support.use-case';
import { SupportListQueryDto, SupportUpdateDto } from '../dto/request/support-management.dto';
import { ApiSupportList, ApiSupportUpdate } from '../swagger/support-management';
@HomeAdminProtectedController()
export class HomeAdminSupportController {
    constructor(private readonly useCase: ManageSupportUseCase) {}
    /** 관리자에게 현재 환경의 접수와 이력을 제공한다. */
    @Get('support')
    @ApiSupportList()
    async list(@Query() query: SupportListQueryDto) {
        return ApiResponseDto.success(
            await this.useCase.list(query.page, query.status, query.receiptId),
            '접수 조회됨',
        );
    }
    /** 인증된 관리자 신원으로 상태 변경을 기록한다. */
    @Patch('support/:eventId')
    @ApiSupportUpdate()
    async update(
        @Param('eventId', ParseUUIDPipe) eventId: string,
        @CurrentUser('userId') actorId: string,
        @Body() body: SupportUpdateDto,
    ) {
        return ApiResponseDto.success(await this.useCase.update(eventId, actorId, { ...body }), '접수 변경됨');
    }
}
