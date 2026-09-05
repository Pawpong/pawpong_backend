import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../../../common/decorator/user.decorator';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { GetBreedersUseCase } from '../application/use-cases/get-breeders.use-case';
import { GetPendingBreederVerificationsUseCase } from '../application/use-cases/get-pending-breeder-verifications.use-case';
import { BreederVerificationAdminProtectedController } from '../decorator/breeder-verification-admin-controller.decorator';
import { BreederSearchRequestDto } from '../dto/request/breeder-search-request.dto';
import { BreederVerificationResponseDto } from '../dto/response/breeder-verification-response.dto';
import { BREEDER_RESPONSE_MESSAGES } from '../../../../service/breeder/constants/breeder-response-messages';
import { ApiGetBreedersAdminEndpoint, ApiGetPendingBreederVerificationsAdminEndpoint } from '../swagger/index';

@BreederVerificationAdminProtectedController()
export class BreederVerificationAdminQueryController {
    constructor(
        private readonly getBreedersUseCase: GetBreedersUseCase,
        private readonly getPendingBreederVerificationsUseCase: GetPendingBreederVerificationsUseCase,
    ) {}

    @Get('breeders')
    @ApiGetBreedersAdminEndpoint()
    async getBreeders(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getBreedersUseCase.execute(adminId, filter);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            BREEDER_RESPONSE_MESSAGES.breederListRetrieved,
        );
    }

    @Get('verification/pending')
    @ApiGetPendingBreederVerificationsAdminEndpoint()
    async getPendingBreederVerifications(
        @CurrentUser('userId') adminId: string,
        @Query() filter: BreederSearchRequestDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederVerificationResponseDto>>> {
        const result = await this.getPendingBreederVerificationsUseCase.execute(adminId, filter);
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            BREEDER_RESPONSE_MESSAGES.pendingBreederListRetrieved,
        );
    }
}
