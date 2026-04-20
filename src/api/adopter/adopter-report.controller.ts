import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateAdopterReportUseCase } from './application/use-cases/create-adopter-report.use-case';
import type { AdopterReportCreateResult } from './application/types/adopter-result.type';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ReportCreateRequestDto } from './dto/request/report-create-request.dto';
import { ReportCreateResponseDto } from './dto/response/report-create-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './constants/adopter-response-messages';
import { ApiCreateAdopterReportEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterReportController {
    constructor(private readonly createAdopterReportUseCase: CreateAdopterReportUseCase) {}

    @Post('report')
    @ApiCreateAdopterReportEndpoint()
    async createReport(
        @CurrentUser('userId') userId: string,
        @Body() createReportDto: ReportCreateRequestDto,
    ): Promise<ApiResponseDto<ReportCreateResponseDto>> {
        const result = await this.createAdopterReportUseCase.execute(userId, createReportDto);
        return ApiResponseDto.success(
            result as ReportCreateResponseDto & AdopterReportCreateResult,
            ADOPTER_RESPONSE_MESSAGES.reportSubmitted,
        );
    }
}
