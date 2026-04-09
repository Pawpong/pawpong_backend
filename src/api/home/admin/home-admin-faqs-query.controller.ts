import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { HomeAdminProtectedController } from './decorator/home-admin-controller.decorator';
import { HomeResponseMessageService } from '../domain/services/home-response-message.service';
import { FaqResponseDto } from '../dto/response/faq-response.dto';
import { ApiGetAllFaqsAdminEndpoint } from './swagger';

@HomeAdminProtectedController()
export class HomeAdminFaqsQueryController {
    constructor(
        private readonly getAllFaqsUseCase: GetAllFaqsUseCase,
        private readonly homeResponseMessageService: HomeResponseMessageService,
    ) {}

    @Get('faqs')
    @ApiGetAllFaqsAdminEndpoint()
    async getAllFaqs(): Promise<ApiResponseDto<FaqResponseDto[]>> {
        const faqs = await this.getAllFaqsUseCase.execute();
        return ApiResponseDto.success(faqs, this.homeResponseMessageService.faqsRetrieved());
    }
}
