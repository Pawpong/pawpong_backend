import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';
import { HOME_RESPONSE_MESSAGE_EXAMPLES } from './constants/home-response-messages';
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
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<AvailablePetResponseDto[]>> {
        const isAuthenticated = !!userId;
        const pets = await this.getAvailablePetsUseCase.execute(limit, isAuthenticated);
        return ApiResponseDto.success(pets, HOME_RESPONSE_MESSAGE_EXAMPLES.availablePetsRetrieved);
    }
}
