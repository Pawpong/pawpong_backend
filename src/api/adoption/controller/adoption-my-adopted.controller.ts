import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';

import { GetMyAdoptedListUseCase } from '../application/use-cases/get-my-adopted-list.use-case';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/adoption-response-messages';
import { AdoptionProtectedController } from '../decorator/adoption-protected-controller.decorator';
import { AdoptionMyAdoptedQueryDto } from '../dto/request/adoption-my-adopted-query.dto';
import { AdoptedPetCardResponseDto } from '../dto/response/adopted-pet-card.dto';
import { ApiGetMyAdoptedListEndpoint } from '../swagger';

/**
 * GET /v2/adoption/me/adopted — 입양자 본인이 실제로 입양한 펫 목록.
 * AdoptionProtectedController = StrictRolesGuard('adopter') 재사용.
 */
@AdoptionProtectedController()
export class AdoptionMyAdoptedController {
    constructor(private readonly useCase: GetMyAdoptedListUseCase) {}

    @Get('me/adopted')
    @ApiGetMyAdoptedListEndpoint()
    async list(
        @CurrentUser('userId') userId: string,
        @Query() query: AdoptionMyAdoptedQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<AdoptedPetCardResponseDto>>> {
        const result = await this.useCase.execute({
            adopterId: userId,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            ADOPTION_RESPONSE_MESSAGE_EXAMPLES.myAdoptedRetrieved,
        );
    }
}
