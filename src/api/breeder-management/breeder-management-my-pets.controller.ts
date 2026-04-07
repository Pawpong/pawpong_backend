import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederManagementMyPetsUseCase } from './application/use-cases/get-breeder-management-my-pets.use-case';
import { BreederManagementProtectedController } from './decorator/breeder-management-protected-controller.decorator';
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

        return ApiResponseDto.success(result, '개체 목록이 조회되었습니다.');
    }
}
