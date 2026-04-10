import { Controller, Get, Query, Param } from '@nestjs/common';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { MongoObjectIdPipe } from '../../common/pipe/mongo-object-id.pipe';
import { NoticeResponseDto } from './dto/response/notice-response.dto';
import { GetNoticeListUseCase } from './application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from './application/use-cases/get-notice-detail.use-case';
import { NoticeQueryResponseMessageService } from './domain/services/notice-query-response-message.service';
import { ApiGetNoticeDetailEndpoint, ApiGetNoticeListEndpoint, ApiNoticeController } from './swagger';

/**
 * 공지사항 컨트롤러 (공개 API)
 * 모든 사용자가 접근 가능한 공지사항 조회 API
 */
@ApiNoticeController()
@Controller('notice')
export class NoticeController {
    constructor(
        private readonly getNoticeListUseCase: GetNoticeListUseCase,
        private readonly getNoticeDetailUseCase: GetNoticeDetailUseCase,
        private readonly noticeQueryResponseMessageService: NoticeQueryResponseMessageService,
    ) {}

    /**
     * 공지사항 목록 조회 (공개)
     */
    @Get()
    @ApiGetNoticeListEndpoint()
    async getNoticeList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NoticeResponseDto>>> {
        const result = await this.getNoticeListUseCase.execute(paginationData, 'published');
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            this.noticeQueryResponseMessageService.noticeListRetrieved(),
        );
    }

    /**
     * 공지사항 상세 조회 (공개)
     */
    @Get(':noticeId')
    @ApiGetNoticeDetailEndpoint()
    async getNoticeDetail(
        @Param('noticeId', new MongoObjectIdPipe('공지사항')) noticeId: string,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.getNoticeDetailUseCase.execute(noticeId, true);
        return ApiResponseDto.success(result, this.noticeQueryResponseMessageService.noticeDetailRetrieved());
    }
}
