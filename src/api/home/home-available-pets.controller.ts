import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';
import { HomeOptionalAuthController } from './decorator/home-controller.decorator';
import { AvailablePetResponseDto } from './dto/response/available-pet-response.dto';
import { ApiGetHomeAvailablePetsEndpoint } from './swagger';

@HomeOptionalAuthController()
export class HomeAvailablePetsController {
    constructor(private readonly getAvailablePetsUseCase: GetAvailablePetsUseCase) {}

    @Get('available-pets')
    @ApiGetHomeAvailablePetsEndpoint()
    async getAvailablePets(
        @Query('limit') limit: number = 10,
        @CurrentUser() user?: any,
    ): Promise<ApiResponseDto<AvailablePetResponseDto[]>> {
        const isAuthenticated = !!user?.userId;
        const pets = await this.getAvailablePetsUseCase.execute(limit, isAuthenticated);
        return ApiResponseDto.success(pets, '분양중인 아이들이 조회되었습니다.');
    }
}
