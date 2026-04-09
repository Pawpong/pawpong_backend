import { Body, Delete, Param, Post, Put } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { HomeFaqResponseMessageService } from '../domain/services/home-faq-response-message.service';
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
        private readonly homeFaqResponseMessageService: HomeFaqResponseMessageService,
    ) {}

    @Post('faq')
    @ApiCreateFaqAdminEndpoint()
    async createFaq(@Body() data: FaqCreateRequestDto): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.createFaqUseCase.execute(data);
        return ApiResponseDto.success(faq, this.homeFaqResponseMessageService.faqCreated());
    }

    @Put('faq/:faqId')
    @ApiUpdateFaqAdminEndpoint()
    async updateFaq(
        @Param('faqId') faqId: string,
        @Body() data: FaqUpdateRequestDto,
    ): Promise<ApiResponseDto<FaqResponseDto>> {
        const faq = await this.updateFaqUseCase.execute(faqId, data);
        return ApiResponseDto.success(faq, this.homeFaqResponseMessageService.faqUpdated());
    }

    @Delete('faq/:faqId')
    @ApiDeleteFaqAdminEndpoint()
    async deleteFaq(@Param('faqId') faqId: string): Promise<ApiResponseDto<null>> {
        await this.deleteFaqUseCase.execute(faqId);
        return ApiResponseDto.success(null, this.homeFaqResponseMessageService.faqDeleted());
    }
}
