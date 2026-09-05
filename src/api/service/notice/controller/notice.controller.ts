import { Controller, Get, Query, Param } from '@nestjs/common';

import { PaginationRequestDto } from '../../../../common/dto/pagination/pagination-request.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { NoticeResponseDto } from '../dto/response/notice-response.dto';
import { GetNoticeListUseCase } from '../application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from '../application/use-cases/get-notice-detail.use-case';
import { NOTICE_RESPONSE_MESSAGE_EXAMPLES } from '../constants/notice-response-messages';
import { ApiGetNoticeDetailEndpoint, ApiGetNoticeListEndpoint, ApiNoticeController } from '../swagger/index';

/**
 * 공지사항 컨트롤러 (공개 API)
 * 모든 사용자가 접근 가능한 공지사항 조회 API
 */
@ApiNoticeController()
@Controller('v2/notice')
export class NoticeController {
    constructor(
        private readonly getNoticeListUseCase: GetNoticeListUseCase,
        private readonly getNoticeDetailUseCase: GetNoticeDetailUseCase,
    ) {}

    // 공지사항 목록 조회 (공개)
    // JSDoc 블록으로 쓰면 swagger 플러그인(introspectComments)이 이 문구로
    // ApiOperation 을 덮어써 summary 가 사라진다. 문서는 swagger/index.ts 가 소유한다.
    @Get()
    @ApiGetNoticeListEndpoint()
    async getNoticeList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NoticeResponseDto>>> {
        const result = await this.getNoticeListUseCase.execute(paginationData, 'published');
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeListRetrieved,
        );
    }

    // 공지사항 상세 조회 (공개)
    @Get(':noticeId')
    @ApiGetNoticeDetailEndpoint()
    async getNoticeDetail(
        @Param('noticeId', new MongoObjectIdPipe('공지사항')) noticeId: string,
    ): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.getNoticeDetailUseCase.execute(noticeId, true);
        return ApiResponseDto.success(result, NOTICE_RESPONSE_MESSAGE_EXAMPLES.noticeDetailRetrieved);
    }
}
