import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { CreateNoticeUseCase } from './application/use-cases/create-notice.use-case';
import { DeleteNoticeUseCase } from './application/use-cases/delete-notice.use-case';
import { UpdateNoticeUseCase } from './application/use-cases/update-notice.use-case';
import { NoticeAdminProtectedController } from './decorator/notice-admin-controller.decorator';
import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
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
    ) {}

    @Post()
    @ApiCreateNoticeAdminEndpoint()
    async createNotice(
        @CurrentUser('userId') adminId: string,
        @Body() createData: NoticeCreateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.createNoticeUseCase.execute(adminId, '관리자', createData);
        return ApiResponseDto.success(result, NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeCreated);
    }

    @Patch(':noticeId')
    @ApiUpdateNoticeAdminEndpoint()
    async updateNotice(
        @CurrentUser('userId') adminId: string,
        @Param('noticeId', new MongoObjectIdPipe('공지', '올바르지 않은 공지 ID 형식입니다.')) noticeId: string,
        @Body() updateData: NoticeUpdateRequestDto,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.updateNoticeUseCase.execute(noticeId, adminId, updateData);
        return ApiResponseDto.success(result, NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeUpdated);
    }

    @Delete(':noticeId')
    @ApiDeleteNoticeAdminEndpoint()
    async deleteNotice(
        @CurrentUser('userId') adminId: string,
        @Param('noticeId', new MongoObjectIdPipe('공지', '올바르지 않은 공지 ID 형식입니다.')) noticeId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteNoticeUseCase.execute(noticeId, adminId);
        return ApiResponseDto.success(null, NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDeleted);
    }
}
