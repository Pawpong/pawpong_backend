import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederApplicationFormUseCase } from './application/use-cases/get-breeder-application-form.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { BreederOptionalAuthController, BreederPublicController } from './decorator/breeder-public-controller.decorator';
import { BreederProfileResponseDto } from './dto/response/breeder-profile-response.dto';
import { PublicApplicationFormResponseDto } from './dto/response/public-application-form.dto';
import { ApiGetBreederApplicationFormEndpoint, ApiGetBreederProfileEndpoint } from './swagger/decorators';

@BreederOptionalAuthController()
export class BreederProfileController {
    constructor(private readonly getBreederProfileUseCase: GetBreederProfileUseCase) {}

    @Get(':id')
    @ApiGetBreederProfileEndpoint()
    async getBreederProfile(
        @Param('id') breederId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<BreederProfileResponseDto>> {
        const result = await this.getBreederProfileUseCase.execute(breederId, userId);
        return ApiResponseDto.success(result, '브리더 프로필이 조회되었습니다.');
    }
}

@BreederPublicController()
export class BreederApplicationFormController {
    constructor(private readonly getBreederApplicationFormUseCase: GetBreederApplicationFormUseCase) {}

    @Get(':id/application-form')
    @ApiGetBreederApplicationFormEndpoint()
    async getApplicationForm(
        @Param('id') breederId: string,
    ): Promise<ApiResponseDto<PublicApplicationFormResponseDto>> {
        const result = await this.getBreederApplicationFormUseCase.execute(breederId);
        return ApiResponseDto.success(result, '입양 신청 폼 구조가 조회되었습니다.');
    }
}
