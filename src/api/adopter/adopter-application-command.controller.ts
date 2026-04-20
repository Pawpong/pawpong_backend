import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CreateAdopterApplicationUseCase } from './application/use-cases/create-adopter-application.use-case';
import type { AdopterApplicationCreateResult } from './application/types/adopter-result.type';
import { AdopterProtectedController } from './decorator/adopter-protected-controller.decorator';
import { ApplicationCreateRequestDto } from './dto/request/application-create-request.dto';
import { ApplicationCreateResponseDto } from './dto/response/application-create-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from './constants/adopter-response-messages';
import { ApiCreateAdopterApplicationEndpoint } from './swagger';

@AdopterProtectedController()
export class AdopterApplicationCommandController {
    constructor(private readonly createAdopterApplicationUseCase: CreateAdopterApplicationUseCase) {}

    @Post('application')
    @ApiCreateAdopterApplicationEndpoint()
    async createApplication(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() createApplicationDto: ApplicationCreateRequestDto,
    ): Promise<ApiResponseDto<ApplicationCreateResponseDto>> {
        const result = await this.createAdopterApplicationUseCase.execute(userId, createApplicationDto, role);
        return ApiResponseDto.success(
            result as ApplicationCreateResponseDto & AdopterApplicationCreateResult,
            ADOPTER_RESPONSE_MESSAGES.applicationCreated,
        );
    }
}
