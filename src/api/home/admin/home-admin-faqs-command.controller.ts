import { Body, Delete, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { HOME_RESPONSE_MESSAGE_EXAMPLES } from '../constants/home-response-messages';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { FaqCreateRequestDto } from './dto/request/faq-create-request.dto';
import { FaqUpdateRequestDto } from './dto/request/faq-update-request.dto';
import { FaqResponseDto } from '../dto/response/faq-response.dto';
import {
    ApiCreateFaqAdminEndpoint,
    ApiDeleteFaqAdminEndpoint,
    ApiUpdateFaqAdminEndpoint,
} from './swagger';

@HomeAdminProtectedController()
export class HomeAdminFaqsCommandController {
    constructor(
        private readonly createFaqUseCase: CreateFaqUseCase,
        private readonly updateFaqUseCase: UpdateFaqUseCase,
        private readonly deleteFaqUseCase: DeleteFaqUseCase,
    ) {}

    @Post('faq')
    @ApiCreateFaqAdminEndpoint()
    async createFaq(@Body() data: FaqCreateRequestDto): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.createFaqUseCase.execute(data);
        return ApiResponseDto.success(faq, HOME_RESPONSE_MESSAGE_EXAMPLES.faqCreated);
    }

    @Put('faq/:faqId')
    @ApiUpdateFaqAdminEndpoint()
    async updateFaq(
        @Param('faqId') faqId: string,
        @Body() data: FaqUpdateRequestDto,
    ): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.updateFaqUseCase.execute(faqId, data);
        return ApiResponseDto.success(faq, HOME_RESPONSE_MESSAGE_EXAMPLES.faqUpdated);
    }

    @Delete('faq/:faqId')
    @ApiDeleteFaqAdminEndpoint()
    async deleteFaq(@Param('faqId') faqId: string): Promise<ApiResponseDto<null>> {
        await this.deleteFaqUseCase.execute(faqId);
        return ApiResponseDto.success(null, HOME_RESPONSE_MESSAGE_EXAMPLES.faqDeleted);
    }
}
