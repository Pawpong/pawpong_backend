import { Get, Param, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAdopterAdminApplicationDetailUseCase } from './application/use-cases/get-adopter-admin-application-detail.use-case';
import { GetAdopterAdminApplicationListUseCase } from './application/use-cases/get-adopter-admin-application-list.use-case';
import { AdopterAdminProtectedController } from './decorator/adopter-admin-controller.decorator';
import { ApplicationListRequestDto } from './dto/request/application-list-request.dto';
import { AdminApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { AdminApplicationListResponseDto } from './dto/response/application-list-response.dto';
import { ApiGetAdopterAdminApplicationDetailEndpoint, ApiGetAdopterAdminApplicationListEndpoint } from './swagger';

@AdopterAdminProtectedController()
export class AdopterAdminApplicationController {
    constructor(
        private readonly getAdopterAdminApplicationListUseCase: GetAdopterAdminApplicationListUseCase,
        private readonly getAdopterAdminApplicationDetailUseCase: GetAdopterAdminApplicationDetailUseCase,
    ) {}

    @Get('applications')
    @ApiGetAdopterAdminApplicationListEndpoint()
    async getApplicationList(
        @CurrentUser('userId') adminId: string,
        @Query() filters: ApplicationListRequestDto,
    ): Promise<ApiResponseDto<AdminApplicationListResponseDto>> {
        const result = await this.getAdopterAdminApplicationListUseCase.execute(adminId, filters);
        return ApiResponseDto.success(result, '입양 신청 리스트가 조회되었습니다.');
    }

    @Get('applications/:applicationId')
    @ApiGetAdopterAdminApplicationDetailEndpoint()
    async getApplicationDetail(
        @CurrentUser('userId') adminId: string,
        @Param('applicationId') applicationId: string,
    ): Promise<ApiResponseDto<AdminApplicationDetailResponseDto>> {
        const result = await this.getAdopterAdminApplicationDetailUseCase.execute(adminId, applicationId);
        return ApiResponseDto.success(result, '입양 신청 상세 정보가 조회되었습니다.');
    }
}
