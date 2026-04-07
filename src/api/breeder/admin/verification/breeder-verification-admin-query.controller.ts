import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetBreedersUseCase } from './application/use-cases/get-breeders.use-case';
import { GetLevelChangeRequestsUseCase } from './application/use-cases/get-level-change-requests.use-case';
import { GetPendingBreederVerificationsUseCase } from './application/use-cases/get-pending-breeder-verifications.use-case';
import { BreederVerificationAdminProtectedController } from './decorator/breeder-verification-admin-controller.decorator';
import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederVerificationResponseDto } from './dto/response/breeder-verification-response.dto';
import {
    ApiGetBreedersAdminEndpoint,
    ApiGetLevelChangeRequestsAdminEndpoint,
    ApiGetPendingBreederVerificationsAdminEndpoint,
} from './swagger';

@BreederVerificationAdminProtectedController()
export class BreederVerificationAdminQueryController {
    constructor(
        private readonly getBreedersUseCase: GetBreedersUseCase,
        private readonly getPendingBreederVerificationsUseCase: GetPendingBreederVerificationsUseCase,
        private readonly getLevelChangeRequestsUseCase: GetLevelChangeRequestsUseCase,
    ) {}

    @Get('breeders')
    @ApiGetBreedersAdminEndpoint()
    async getBreeders(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getBreedersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '브리더 목록이 조회되었습니다.');
    }

    @Get('verification/pending')
    @ApiGetPendingBreederVerificationsAdminEndpoint()
    async getPendingBreederVerifications(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getPendingBreederVerificationsUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '승인 대기 브리더 목록이 조회되었습니다.');
    }

    @Get('verification/level-change-requests')
    @ApiGetLevelChangeRequestsAdminEndpoint()
    async getLevelChangeRequests(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getLevelChangeRequestsUseCase.execute(adminId, filter);
        return ApiResponseDto.success(result, '레벨 변경 신청 목록이 조회되었습니다.');
    }
}
