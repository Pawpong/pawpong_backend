import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementMyPetsUseCase } from './application/use-cases/get-breeder-management-my-pets.use-case';
import type { BreederManagementMyPetsPageResult } from './application/types/breeder-management-result.type';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from './domain/services/breeder-management-response-message.service';
import { MyPetsQueryRequestDto } from './dto/request/my-pets-query-request.dto';
import { MyPetsListResponseDto } from './dto/response/my-pets-list-response.dto';
import { BreederManagementSwaggerDocs } from './swagger';

@BreederManagementProtectedController()
export class BreederManagementMyPetsController {
    constructor(private readonly getBreederManagementMyPetsUseCase: GetBreederManagementMyPetsUseCase) {}

    @Get('my-pets')
    @ApiPaginatedEndpoint(BreederManagementSwaggerDocs.myPets)
    async getMyPets(
        @CurrentUser('userId') userId: string,
        @Query() query: MyPetsQueryRequestDto,
    ): Promise<ApiResponseDto<MyPetsListResponseDto>> {
        const result = await this.getBreederManagementMyPetsUseCase.execute(
            userId,
            query.status,
            query.includeInactive,
            query.page,
            query.limit,
        );
        const response = PaginationResponseDto.fromPageResult(result) as MyPetsListResponseDto;
        response.availableCount = result.availableCount;
        response.reservedCount = result.reservedCount;
        response.adoptedCount = result.adoptedCount;
        response.inactiveCount = result.inactiveCount;

        return ApiResponseDto.success(
            response as MyPetsListResponseDto & BreederManagementMyPetsPageResult,
            BREEDER_MANAGEMENT_RESPONSE_MESSAGES.myPetsRetrieved,
        );
    }
}
