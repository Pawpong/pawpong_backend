import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { NoticeService } from './notice.service';

import { PaginationRequestDto } from '../../common/dto/pagination/pagination-request.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { NoticeResponseDto } from './dto/response/notice-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

/**
 * 공지사항 컨트롤러 (공개 API)
 * 모든 사용자가 접근 가능한 공지사항 조회 API
 */
@ApiTags('공지사항')
@Controller('notice')
export class NoticeController {
    constructor(private readonly noticeService: NoticeService) {}

    /**
     * 공지사항 목록 조회 (공개)
     */
    @Get()
    @ApiOperation({
        summary: '공지사항 목록 조회',
        description: '게시된 공지사항 목록을 페이지네이션으로 조회합니다.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '페이지 크기', example: 10 })
    @ApiResponse({ status: 200, description: '성공', type: PaginationResponseDto<NoticeResponseDto> })
    async getNoticeList(
        @Query() paginationData: PaginationRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<NoticeResponseDto>>> {
        const result = await this.noticeService.getNoticeList(paginationData, 'published');
        return {
            success: true,
            code: 200,
            data: result,
            message: '공지사항 목록 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * 공지사항 상세 조회 (공개)
     */
    @Get(':noticeId')
    @ApiOperation({
        summary: '공지사항 상세 조회',
        description: '특정 공지사항의 상세 정보를 조회합니다. 조회 시 조회수가 증가합니다.',
    })
    @ApiResponse({ status: 200, description: '성공', type: NoticeResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '공지사항을 찾을 수 없음' })
    async getNoticeDetail(@Param('noticeId') noticeId: string): Promise<ApiResponseDto<NoticeResponseDto>> {
        const result = await this.noticeService.getNoticeDetail(noticeId, true);
        return {
            success: true,
            code: 200,
            data: result,
            message: '공지사항 조회 성공',
            timestamp: new Date().toISOString(),
        };
    }
}
