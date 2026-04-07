import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { FaqCreateRequestDto } from './dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from './dto/request/faq-update-request.dto';
import { FaqResponseDto } from '../dto/response/faq-response.dto';
import {
    ApiCreateFaqAdminEndpoint,
    ApiDeleteFaqAdminEndpoint,
    ApiGetAllFaqsAdminEndpoint,
    ApiUpdateFaqAdminEndpoint,
} from './swagger';

@HomeAdminProtectedController()
export class HomeAdminFaqsController {
    constructor(
        private readonly getAllFaqsUseCase: GetAllFaqsUseCase,
        private readonly createFaqUseCase: CreateFaqUseCase,
        private readonly updateFaqUseCase: UpdateFaqUseCase,
        private readonly deleteFaqUseCase: DeleteFaqUseCase,
    ) {}

    @Get('faqs')
    @ApiGetAllFaqsAdminEndpoint()
    async getAllFaqs(): Promise<ApiResponseDto<FaqResponseDto[]>> {
        const faqs = await this.getAllFaqsUseCase.execute();
        return ApiResponseDto.success(faqs, 'FAQ 목록이 조회되었습니다.');
    }

    @Post('faq')
    @ApiCreateFaqAdminEndpoint()
    async createFaq(@Body() data: FaqCreateRequestDto): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.createFaqUseCase.execute(data);
        return ApiResponseDto.success(faq, 'FAQ가 생성되었습니다.');
    }

    @Put('faq/:faqId')
    @ApiUpdateFaqAdminEndpoint()
    async updateFaq(
        @Param('faqId') faqId: string,
        @Body() data: FaqUpdateRequestDto,
    ): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.updateFaqUseCase.execute(faqId, data);
        return ApiResponseDto.success(faq, 'FAQ가 수정되었습니다.');
    }

    @Delete('faq/:faqId')
    @ApiDeleteFaqAdminEndpoint()
    async deleteFaq(@Param('faqId') faqId: string): Promise<ApiResponseDto<null>> {
        await this.deleteFaqUseCase.execute(faqId);
        return ApiResponseDto.success(null, 'FAQ가 삭제되었습니다.');
    }
}
