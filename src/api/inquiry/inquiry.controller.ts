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

import {
    InquiryCreateRequestDto,
    InquiryUpdateRequestDto,
    InquiryAnswerCreateRequestDto,
} from './dto/request/inquiry-create-request.dto';
import { InquiryListResponseDto } from './dto/response/inquiry-list-response.dto';
import { InquiryDetailResponseDto } from './dto/response/inquiry-detail-response.dto';
import { CreateInquiryAnswerUseCase } from './application/use-cases/create-inquiry-answer.use-case';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { GetBreederInquiriesUseCase } from './application/use-cases/get-breeder-inquiries.use-case';
import { GetInquiryDetailUseCase } from './application/use-cases/get-inquiry-detail.use-case';
import { GetInquiryListUseCase } from './application/use-cases/get-inquiry-list.use-case';
import { GetMyInquiriesUseCase } from './application/use-cases/get-my-inquiries.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';

/**
 * 문의 컨트롤러
 * 입양자 질문 작성/수정/삭제, 브리더 답변, 목록/상세 조회
 */
@ApiController('문의')
@Controller('inquiry')
export class InquiryController {
    constructor(
        private readonly getInquiryListUseCase: GetInquiryListUseCase,
        private readonly getInquiryDetailUseCase: GetInquiryDetailUseCase,
        private readonly getMyInquiriesUseCase: GetMyInquiriesUseCase,
        private readonly getBreederInquiriesUseCase: GetBreederInquiriesUseCase,
        private readonly createInquiryUseCase: CreateInquiryUseCase,
        private readonly updateInquiryUseCase: UpdateInquiryUseCase,
        private readonly deleteInquiryUseCase: DeleteInquiryUseCase,
        private readonly createInquiryAnswerUseCase: CreateInquiryAnswerUseCase,
    ) {}

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
        const result = await this.getMyInquiriesUseCase.execute(
            this.getRequiredUserId(user),
            parseInt(page) || 1,
            parseInt(limit) || 15,
            animalType,
        );
        return ApiResponseDto.success(result, '내 질문 목록이 조회되었습니다.');
    }

    /**
     * 브리더 전용: 내게 들어온 1:1 질문 목록 조회 (내 답변 페이지)
     * 주의: ':inquiryId' 파라미터 라우트보다 위에 선언
     */
    @Get('breeder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('breeder')
    @ApiEndpoint({
        summary: '브리더 문의 목록 조회',
        description:
            '브리더에게 들어온 1:1 질문 목록을 조회합니다. answered=true이면 답변 완료, false이면 답변 전 목록입니다.',
        responseType: InquiryListResponseDto,
        isPublic: false,
    })
    async getBreederInquiries(
        @CurrentUser() user: any,
        @Query('answered') answered: string = 'false',
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '15',
    ): Promise<ApiResponseDto<InquiryListResponseDto>> {
        const result = await this.getBreederInquiriesUseCase.execute(
            this.getRequiredUserId(user),
            answered === 'true',
            parseInt(page) || 1,
            parseInt(limit) || 15,
        );
        return ApiResponseDto.success(result, '브리더 문의 목록이 조회되었습니다.');
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
        const result = await this.getInquiryListUseCase.execute(
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
        const result = await this.getInquiryDetailUseCase.execute(inquiryId, user?.userId);
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
        const result = await this.createInquiryUseCase.execute(this.getRequiredUserId(user), dto);
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
        await this.updateInquiryUseCase.execute(inquiryId, this.getRequiredUserId(user), dto);
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
        await this.deleteInquiryUseCase.execute(inquiryId, this.getRequiredUserId(user));
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
        await this.createInquiryAnswerUseCase.execute(inquiryId, this.getRequiredUserId(user), dto);
        return ApiResponseDto.success(null, '답변이 작성되었습니다.');
    }

    private getRequiredUserId(user: any): string {
        if (!user?.userId) {
            throw new BadRequestException('사용자 정보가 올바르지 않습니다.');
        }

        return user.userId;
    }
}
