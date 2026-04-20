import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateInquiryUseCase } from './application/use-cases/create-inquiry.use-case';
import { DeleteInquiryUseCase } from './application/use-cases/delete-inquiry.use-case';
import { UpdateInquiryUseCase } from './application/use-cases/update-inquiry.use-case';
import { INQUIRY_RESPONSE_MESSAGE_EXAMPLES } from './constants/inquiry-response-messages';
import { InquiryProtectedController } from './decorator/inquiry-controller.decorator';
import {
    InquiryCreateRequestDto,
    InquiryUpdateRequestDto,
} from './dto/request/inquiry-create-request.dto';
import { InquiryCreateResponseDto } from './dto/response/inquiry-create-response.dto';
import {
    ApiCreateInquiryEndpoint,
    ApiDeleteInquiryEndpoint,
    ApiUpdateInquiryEndpoint,
} from './swagger';

@InquiryProtectedController('adopter')
export class InquiryAdopterCommandController {
    constructor(
        private readonly createInquiryUseCase: CreateInquiryUseCase,
        private readonly updateInquiryUseCase: UpdateInquiryUseCase,
        private readonly deleteInquiryUseCase: DeleteInquiryUseCase,
    ) {}

    @Post()
    @ApiCreateInquiryEndpoint()
    async createInquiry(
        @CurrentUser('userId') userId: string,
        @Body() dto: InquiryCreateRequestDto,
    ): Promise<ApiResponseDto<InquiryCreateResponseDto>> {
        const result = await this.createInquiryUseCase.execute(userId, dto);
        return ApiResponseDto.success(result, INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated);
    }

    @Patch(':inquiryId')
    @ApiUpdateInquiryEndpoint()
    async updateInquiry(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: InquiryUpdateRequestDto,
    ): Promise<ApiResponseDto<null>> {
        await this.updateInquiryUseCase.execute(inquiryId, userId, dto);
        return ApiResponseDto.success(null, INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated);
    }

    @Delete(':inquiryId')
    @ApiDeleteInquiryEndpoint()
    async deleteInquiry(
        @Param('inquiryId') inquiryId: string,
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<null>> {
        await this.deleteInquiryUseCase.execute(inquiryId, userId);
        return ApiResponseDto.success(null, INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted);
    }
}
