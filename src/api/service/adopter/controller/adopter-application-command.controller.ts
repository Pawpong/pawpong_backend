import { Body, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';
import { CreateAdopterApplicationUseCase } from '../application/use-cases/create-adopter-application.use-case';
import { UpdateAdopterApplicationUseCase } from '../application/use-cases/update-adopter-application.use-case';
import { AdopterProtectedController } from '../decorator/adopter-protected-controller.decorator';
import { ApplicationCreateRequestDto } from '../dto/request/application-create-request.dto';
import { ApplicationUpdateRequestDto } from '../dto/request/application-update-request.dto';
import { ApplicationCreateResponseDto } from '../dto/response/application-create-response.dto';
import { ApplicationUpdateResponseDto } from '../dto/response/application-update-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from '../constants/adopter-response-messages';
import { ApiCreateAdopterApplicationEndpoint, ApiUpdateAdopterApplicationEndpoint } from '../swagger/index';

@AdopterProtectedController()
export class AdopterApplicationCommandController {
    constructor(
        private readonly createAdopterApplicationUseCase: CreateAdopterApplicationUseCase,
        private readonly updateAdopterApplicationUseCase: UpdateAdopterApplicationUseCase,
    ) {}

    @Post('application')
    @HttpCode(HttpStatus.OK)
    @ApiCreateAdopterApplicationEndpoint()
    async createApplication(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() createApplicationDto: ApplicationCreateRequestDto,
    ): Promise<ApiResponseDto<ApplicationCreateResponseDto>> {
        const result = await this.createAdopterApplicationUseCase.execute(userId, createApplicationDto, role);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.applicationCreated);
    }

    // 표준 RolesGuard 의 breeder -> adopter fallback 을 그대로 둔다 — 브리더 계정도 다른
    // 브리더에게 입양 신청을 넣을 수 있고(생성과 동일 정책), 자기가 넣은 신청은 수정도 가능해야 한다.
    @Patch('application/:applicationId')
    @HttpCode(HttpStatus.OK)
    @ApiUpdateAdopterApplicationEndpoint()
    async updateApplication(
        @CurrentUser('userId') userId: string,
        @Param('applicationId', new MongoObjectIdPipe('입양 신청', '올바르지 않은 입양 신청 ID 형식입니다.'))
        applicationId: string,
        @Body() updateApplicationDto: ApplicationUpdateRequestDto,
    ): Promise<ApiResponseDto<ApplicationUpdateResponseDto>> {
        const result = await this.updateAdopterApplicationUseCase.execute(userId, applicationId, updateApplicationDto);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.applicationUpdated);
    }
}
