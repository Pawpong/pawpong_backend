import { Get, Param, Query } from '@nestjs/common';

import { PaginationRequestDto } from '../../../common/dto/pagination/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetNoticeDetailUseCase } from '../application/use-cases/get-notice-detail.use-case';
import { GetNoticeListUseCase } from '../application/use-cases/get-notice-list.use-case';
import { NoticeStatus } from '../application/ports/notice-reader.port';
import { NoticeAdminProtectedController } from './decorator/notice-admin-controller.decorator';
import { NoticeQueryResponseMessageService } from '../domain/services/notice-query-response-message.service';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';
import {
    ApiGetNoticeDetailAdminEndpoint,
    ApiGetNoticeListAdminEndpoint,
} from './swagger';

@NoticeAdminProtectedController()
export class NoticeAdminQueryController {
    constructor(
        private readonly getNoticeListUseCase: GetNoticeListUseCase,
        private readonly getNoticeDetailUseCase: GetNoticeDetailUseCase,
        private readonly noticeQueryResponseMessageService: NoticeQueryResponseMessageService,
    ) {}

    @Get()
    @ApiGetNoticeListAdminEndpoint()
    async getNoticeListAdmin(
        @Query() paginationData: PaginationRequestDto,
        @Query('status') status?: 'published' | 'draft' | 'archived',
    ): Promise<ApiResponseDto<PaginationResponseDto<NoticeResponseDto>>> {
        const result = await this.getNoticeListUseCase.execute(paginationData, status as NoticeStatus | undefined);
        return ApiResponseDto.success(result, this.noticeQueryResponseMessageService.noticeListRetrieved());
    }

    @Get(':noticeId')
    @ApiGetNoticeDetailAdminEndpoint()
    async getNoticeDetailAdmin(@Param('noticeId') noticeId: string): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.getNoticeDetailUseCase.execute(noticeId, false);
        return ApiResponseDto.success(result, this.noticeQueryResponseMessageService.noticeDetailRetrieved());
    }
}
