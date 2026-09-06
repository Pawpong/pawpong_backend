import { Body, Delete, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AddFavoriteBreederUseCase } from '../application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from '../application/use-cases/remove-favorite-breeder.use-case';
import { AdopterProtectedController } from '../decorator/adopter-protected-controller.decorator';
import { FavoriteAddRequestDto } from '../dto/request/favorite-add-request.dto';
import { FavoriteAddResponseDto } from '../dto/response/favorite-add-response.dto';
import { FavoriteRemoveResponseDto } from '../dto/response/favorite-remove-response.dto';
import { ADOPTER_RESPONSE_MESSAGES } from '../constants/adopter-response-messages';
import { ApiAddAdopterFavoriteEndpoint, ApiRemoveAdopterFavoriteEndpoint } from '../swagger/index';

/**
 * 브리더 즐겨찾기 추가/제거.
 *
 * RolesGuard 의 breeder → adopter fallback 때문에 브리더도 이 컨트롤러를 호출한다.
 * 저장소가 역할에 따라 Adopter.favoriteBreederList / Breeder.favoriteBreederList 로 갈리므로
 * 현재 사용자의 role 을 반드시 유스케이스까지 전달해야 한다.
 * (누락하면 브리더 id 를 adopters 컬렉션에서 찾다가 "입양자 정보를 찾을 수 없습니다." 로 실패한다)
 */
@AdopterProtectedController()
export class AdopterFavoriteCommandController {
    constructor(
        private readonly addFavoriteBreederUseCase: AddFavoriteBreederUseCase,
        private readonly removeFavoriteBreederUseCase: RemoveFavoriteBreederUseCase,
    ) {}

    @Post('favorite')
    @HttpCode(HttpStatus.OK)
    @ApiAddAdopterFavoriteEndpoint()
    async addFavorite(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Body() addFavoriteDto: FavoriteAddRequestDto,
    ): Promise<ApiResponseDto<FavoriteAddResponseDto>> {
        const result = await this.addFavoriteBreederUseCase.execute(userId, addFavoriteDto, role);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.favoriteAdded);
    }

    @Delete('favorite/:breederId')
    @ApiRemoveAdopterFavoriteEndpoint()
    async removeFavorite(
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<FavoriteRemoveResponseDto>> {
        const result = await this.removeFavoriteBreederUseCase.execute(userId, breederId, role);
        return ApiResponseDto.success(result, ADOPTER_RESPONSE_MESSAGES.favoriteRemoved);
    }
}
