import { Get, Query } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

import { ListMyBreederPetPostingsUseCase } from './application/use-cases/list-my-breeder-pet-postings.use-case';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from './constants/breeder-pet-posting-response-messages';
import { BreederPetPostingProtectedController } from './decorator/breeder-pet-posting-protected-controller.decorator';
import { BreederPetPostingMyListQueryDto } from './dto/request/breeder-pet-posting-my-list-query.dto';
import { BreederPetPostingCardResponseDto } from './dto/response/breeder-pet-posting-card.dto';
import { ApiListMyBreederPetPostingsEndpoint } from './swagger';

/**
 * GET /v2/breeder-pet-posting/me — 브리더 본인의 분양글 목록 (마이홈 분양목록 탭).
 */
@BreederPetPostingProtectedController()
export class BreederPetPostingListController {
    constructor(private readonly useCase: ListMyBreederPetPostingsUseCase) {}

    @Get('me')
    @ApiListMyBreederPetPostingsEndpoint()
    async listMine(
        @CurrentUser('userId') userId: string,
        @Query() query: BreederPetPostingMyListQueryDto,
    ): Promise<ApiResponseDto<PaginationResponseDto<BreederPetPostingCardResponseDto>>> {
        const result = await this.useCase.execute({
            breederId: userId,
            status: query.status,
            page: query.page,
            pageSize: query.pageSize,
        });
        return ApiResponseDto.success(
            PaginationResponseDto.fromPageResult(result),
            BREEDER_PET_POSTING_RESPONSE_MESSAGES.myListRetrieved,
        );
    }
}
