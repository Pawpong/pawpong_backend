import { Delete, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { AddAdoptionPetFavoriteUseCase } from '../application/use-cases/add-adoption-pet-favorite.use-case';
import { RemoveAdoptionPetFavoriteUseCase } from '../application/use-cases/remove-adoption-pet-favorite.use-case';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/adoption-response-messages';
import { AdoptionProtectedController } from '../decorator/adoption-protected-controller.decorator';
import { AdoptionFavoriteResponseDto } from '../dto/response/adoption-pet-response.dto';
import { ApiAddAdoptionFavoriteEndpoint, ApiRemoveAdoptionFavoriteEndpoint } from '../swagger';

/**
 * 입양 페이지 — 동물 단위 관심있어요 토글 (입양자 전용)
 */
@AdoptionProtectedController()
export class AdoptionFavoriteController {
    constructor(
        private readonly addUseCase: AddAdoptionPetFavoriteUseCase,
        private readonly removeUseCase: RemoveAdoptionPetFavoriteUseCase,
    ) {}

    @Post(':petId/favorite')
    @ApiAddAdoptionFavoriteEndpoint()
    async addFavorite(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<AdoptionFavoriteResponseDto>> {
        const result = await this.addUseCase.execute(userId, petId);
        return ApiResponseDto.success(
            { petId, favoriteCount: result.favoriteCount, success: result.added },
            ADOPTION_RESPONSE_MESSAGE_EXAMPLES.favoriteAdded,
        );
    }

    @Delete(':petId/favorite')
    @ApiRemoveAdoptionFavoriteEndpoint()
    async removeFavorite(
        @CurrentUser('userId') userId: string,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<AdoptionFavoriteResponseDto>> {
        const result = await this.removeUseCase.execute(userId, petId);
        return ApiResponseDto.success(
            { petId, favoriteCount: result.favoriteCount, success: result.removed },
            ADOPTION_RESPONSE_MESSAGE_EXAMPLES.favoriteRemoved,
        );
    }
}
