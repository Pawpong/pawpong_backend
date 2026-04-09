import { Get, Query } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { HomePublicController } from './decorator/home-controller.decorator';
import { HomeFaqResponseMessageService } from './domain/services/home-faq-response-message.service';
import { FaqResponseDto } from './dto/response/faq-response.dto';
import { ApiGetHomeFaqsEndpoint } from './swagger';

@HomePublicController()
export class HomeFaqsController {
    constructor(
        private readonly getFaqsUseCase: GetFaqsUseCase,
        private readonly homeFaqResponseMessageService: HomeFaqResponseMessageService,
    ) {}

    @Get('faqs')
    @ApiGetHomeFaqsEndpoint()
    async getFaqs(@Query('userType') userType: string = 'adopter'): Promise<ApiResponseDto<FaqResponseDto[]>> {
        const faqs = await this.getFaqsUseCase.execute(userType);
        return ApiResponseDto.success(faqs, this.homeFaqResponseMessageService.faqsRetrieved());
    }
}
