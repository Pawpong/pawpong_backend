import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { Public } from '../../common/decorator/public.decorator';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';

import { InquiryService } from './inquiry.service';
import {
    InquiryCreateRequestDto,
    InquiryUpdateRequestDto,
    InquiryAnswerCreateRequestDto,
} from './dto/request/inquiry-create-request.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { InquiryDetailResponseDto } from './dto/response/inquiry-detail-response.dto';

/**
 * 문의 컨트롤러
 * 입양자 질문 작성/수정/삭제, 브리더 답변, 목록/상세 조회
 */
@ApiController('문의')
@Controller('inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) {}

    /**
     * 내 질문 목록 조회 (입양자 본인 작성 질문)
     * 주의: ':inquiryId' 파라미터 라우트보다 위에 선언해야 'my'가 파라미터로 인식되지 않음
     */
    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('adopter')
    @ApiEndpoint({
        summary: '내 질문 목록 조회',
        description: '입양자 본인이 작성한 질문 목록을 조회합니다. common/direct 모두 포함됩니다.',
        responseType: InquiryListResponseDto,
        isPublic: false,
    })
    async getMyInquiries(
        @CurrentUser() user: any,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '15',
        @Query('animalType') animalType?: 'dog' | 'cat',
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        const result = await this.inquiryService.getMyInquiries(
            user.userId,
            parseInt(page) || 1,
            parseInt(limit) || 15,
            animalType,
        );
        return ApiResponseDto.success(result, '내 질문 목록이 조회되었습니다.');
    }

    /**
     * 문의 목록 조회 (공통 질문만, 무한스크롤)
     * 인증 없이 접근 가능
     */
    @Public()
    @Get()
    @ApiEndpoint({
        summary: '문의 목록 조회',
        description: '공통 질문 목록을 페이지네이션으로 조회합니다. 동물 종류 필터, 정렬 옵션을 지원합니다.',
        responseType: InquiryListResponseDto,
        isPublic: true,
    })
    async getInquiryList(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '15',
        @Query('animalType') animalType?: 'dog' | 'cat',
        @Query('sort') sort?: string,
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.inquiryService.getInquiryList(
            parseInt(page) || 1,
            parseInt(limit) || 15,
            animalType,
            sort || 'latest_answer',
        );
        return ApiResponseDto.success(result, '문의 목록이 조회되었습니다.');
    }

    /**
     * 문의 상세 조회 (조회수 +1)
     * 공통 질문은 누구나 조회, 1:1 질문은 작성자/대상 브리더만
     */
    @Public()
    @Get(':inquiryId')
    @ApiEndpoint({
        summary: '문의 상세 조회',
        description: '문의 상세 정보와 모든 답변을 조회합니다. 조회 시 조회수가 1 증가합니다.',
        responseType: InquiryDetailResponseDto,
        isPublic: true,
    })
    async getInquiryDetail(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser() user?: any,
    ): Promise<ApiResponseDto<InquiryDetailResponseDto>> {
        const result = await this.inquiryService.getInquiryDetail(inquiryId, user?.userId);
        return ApiResponseDto.success(result, '문의 상세가 조회되었습니다.');
    }

    /**
     * 문의 작성 (입양자만)
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('adopter')
    @ApiEndpoint({
        summary: '문의 작성',
        description: '입양자가 새로운 질문을 작성합니다. common(공통) 또는 direct(1:1) 질문을 지원합니다.',
        isPublic: false,
    })
    async createInquiry(
        @CurrentUser() user: any,
        @Body() dto: InquiryCreateRequestDto,
    ): Promise<ApiResponseDto<{ inquiryId: string }>> {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        const result = await this.inquiryService.createInquiry(user.userId, dto);
        return ApiResponseDto.success(result, '문의가 작성되었습니다.');
    }

    /**
     * 문의 수정 (작성자 본인만, 답변 없는 문의만)
     */
    @Patch(':inquiryId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('adopter')
    @ApiEndpoint({
        summary: '문의 수정',
        description: '작성자 본인이 문의를 수정합니다. 답변이 달린 문의는 수정할 수 없습니다.',
        isPublic: false,
    })
    async updateInquiry(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser() user: any,
        @Body() dto: InquiryUpdateRequestDto,
    ): Promise<ApiResponseDto<null>> {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        await this.inquiryService.updateInquiry(inquiryId, user.userId, dto);
        return ApiResponseDto.success(null, '문의가 수정되었습니다.');
    }

    /**
     * 문의 삭제 (작성자 본인만, 답변 없는 문의만)
     */
    @Delete(':inquiryId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('adopter')
    @ApiEndpoint({
        summary: '문의 삭제',
        description: '작성자 본인이 문의를 삭제합니다. 답변이 달린 문의는 삭제할 수 없습니다.',
        isPublic: false,
    })
    async deleteInquiry(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser() user: any,
    ): Promise<ApiResponseDto<null>> {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        await this.inquiryService.deleteInquiry(inquiryId, user.userId);
        return ApiResponseDto.success(null, '문의가 삭제되었습니다.');
    }

    /**
     * 답변 작성 (브리더만)
     */
    @Post(':inquiryId/answer')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('breeder')
    @ApiEndpoint({
        summary: '답변 작성',
        description: '브리더가 문의에 답변을 작성합니다. 1:1 질문은 대상 브리더만 답변 가능합니다.',
        isPublic: false,
    })
    async createAnswer(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser() user: any,
        @Body() dto: InquiryAnswerCreateRequestDto,
    ): Promise<ApiResponseDto<null>> {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }
        await this.inquiryService.createAnswer(inquiryId, user.userId, dto);
        return ApiResponseDto.success(null, '답변이 작성되었습니다.');
    }
}
