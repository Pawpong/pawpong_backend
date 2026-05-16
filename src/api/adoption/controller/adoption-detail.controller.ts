import { Get, Param } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';
import { GetAdoptionPetDetailUseCase } from '../application/use-cases/get-adoption-pet-detail.use-case';
import { ADOPTION_RESPONSE_MESSAGE_EXAMPLES } from '../constants/adoption-response-messages';
import { AdoptionOptionalAuthController } from '../decorator/adoption-protected-controller.decorator';
import { AdoptionPetDetailResponseDto } from '../dto/response/adoption-pet-detail-response.dto';
import { ApiGetAdoptionDetailEndpoint } from '../swagger';

/**
 * 입양 동물 상세 (Figma 39:1240) — 공개, 로그인 시 isFavorited 채움.
 * GET 요청 시 viewCount 가 원자적으로 +1 증가한다.
 */
@AdoptionOptionalAuthController()
export class AdoptionDetailController {
    constructor(private readonly getAdoptionPetDetailUseCase: GetAdoptionPetDetailUseCase) {}

    @Get(':petId')
    @ApiGetAdoptionDetailEndpoint()
    async getDetail(
        @Param('petId', new MongoObjectIdPipe('동물')) petId: string,
        @CurrentUser('userId') userId?: string,
    ): Promise<ApiResponseDto<AdoptionPetDetailResponseDto>> {
        const result = await this.getAdoptionPetDetailUseCase.execute({ petId, adopterId: userId });
        return ApiResponseDto.success(result, ADOPTION_RESPONSE_MESSAGE_EXAMPLES.detailRetrieved);
    }
}
