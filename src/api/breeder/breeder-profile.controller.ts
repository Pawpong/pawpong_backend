import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../common/pipe/mongo-object-id.pipe';
import { GetBreederApplicationFormUseCase } from './application/use-cases/get-breeder-application-form.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import type { BreederProfileResult } from './application/types/breeder-result.type';
import { BreederOptionalAuthController, BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { PublicApplicationFormResponseDto } from './dto/response/public-application-form.dto';
import { BREEDER_RESPONSE_MESSAGES } from './constants/breeder-response-messages';
import { ApiGetBreederApplicationFormEndpoint, ApiGetBreederProfileEndpoint } from './swagger/decorators';

@BreederOptionalAuthController()
export class BreederProfileController {
    constructor(private readonly getBreederProfileUseCase: GetBreederProfileUseCase) {}

    @Get(':id')
    @ApiGetBreederProfileEndpoint()
    async getBreederProfile(
        @Param('id', new MongoObjectIdPipe('브리더', '올바르지 않은 브리더 ID 형식입니다.')) breederId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<BreederProfileResult>> {
        const result = await this.getBreederProfileUseCase.execute(breederId, userId);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.profileRetrieved);
    }
}

@BreederPublicController()
export class BreederApplicationFormController {
    constructor(private readonly getBreederApplicationFormUseCase: GetBreederApplicationFormUseCase) {}

    @Get(':id/application-form')
    @ApiGetBreederApplicationFormEndpoint()
    async getApplicationForm(
        @Param('id', new MongoObjectIdPipe('브리더', '올바르지 않은 브리더 ID 형식입니다.')) breederId: string,
    ): Promise<ApiResponseDto<PublicApplicationFormResponseDto>> {
        const result = await this.getBreederApplicationFormUseCase.execute(breederId);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.applicationFormRetrieved);
    }
}
