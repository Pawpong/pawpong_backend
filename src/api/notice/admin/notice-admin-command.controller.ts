import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateNoticeUseCase } from './application/use-cases/create-notice.use-case';
import { DeleteNoticeUseCase } from './application/use-cases/delete-notice.use-case';
import { UpdateNoticeUseCase } from './application/use-cases/update-notice.use-case';
import { NoticeAdminProtectedController } from './decorator/notice-admin-controller.decorator';
import { NoticeDeleteResponseMessageService } from '../domain/services/notice-delete-response-message.service';
import { NoticeWriteResponseMessageService } from '../domain/services/notice-write-response-message.service';
import { NoticeCreateRequestDto } from '../dto/request/notice-create-request.dto';
import { NoticeUpdateRequestDto } from '../dto/request/notice-update-request.dto';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';
import {
    ApiCreateNoticeAdminEndpoint,
    ApiDeleteNoticeAdminEndpoint,
    ApiUpdateNoticeAdminEndpoint,
} from './swagger';

@NoticeAdminProtectedController()
export class NoticeAdminCommandController {
    constructor(
        private readonly createNoticeUseCase: CreateNoticeUseCase,
        private readonly updateNoticeUseCase: UpdateNoticeUseCase,
        private readonly deleteNoticeUseCase: DeleteNoticeUseCase,
        private readonly noticeWriteResponseMessageService: NoticeWriteResponseMessageService,
        private readonly noticeDeleteResponseMessageService: NoticeDeleteResponseMessageService,
    ) {}

    @Post()
    @ApiCreateNoticeAdminEndpoint()
    async createNotice(
        @CurrentUser('userId') adminId: string,
        @Body() createData: NoticeCreateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.createNoticeUseCase.execute(adminId, '관리자', createData);
        return ApiResponseDto.success(result, this.noticeWriteResponseMessageService.noticeCreated());
    }

    @Patch(':noticeId')
    @ApiUpdateNoticeAdminEndpoint()
    async updateNotice(
        @CurrentUser('userId') adminId: string,
        @Param('noticeId') noticeId: string,
        @Body() updateData: NoticeUpdateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.updateNoticeUseCase.execute(noticeId, adminId, updateData);
        return ApiResponseDto.success(result, this.noticeWriteResponseMessageService.noticeUpdated());
    }

    @Delete(':noticeId')
    @ApiDeleteNoticeAdminEndpoint()
    async deleteNotice(
        @CurrentUser('userId') adminId: string,
        @Param('noticeId') noticeId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteNoticeUseCase.execute(noticeId, adminId);
        return ApiResponseDto.success(null, this.noticeDeleteResponseMessageService.noticeDeleted());
    }
}
