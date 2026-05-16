import { Body, Delete, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../common/pipe/mongo-object-id.pipe';

import { DeleteBreederPetPostingUseCase } from '../application/use-cases/delete-breeder-pet-posting.use-case';
import { UpdateBreederPetPostingUseCase } from '../application/use-cases/update-breeder-pet-posting.use-case';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from '../constants/breeder-pet-posting-response-messages';
import { BreederPetPostingProtectedController } from '../decorator/breeder-pet-posting-protected-controller.decorator';
import { UpdateBreederPetPostingRequestDto } from '../dto/request/breeder-pet-posting-update-request.dto';
import { BreederPetPostingDeleteResponseDto } from '../dto/response/breeder-pet-posting-delete-response.dto';
import { CreateBreederPetPostingResponseDto } from '../dto/response/breeder-pet-posting-response.dto';
import { ApiDeleteBreederPetPostingEndpoint, ApiUpdateBreederPetPostingEndpoint } from '../swagger';

/**
 * v2 분양글 수정/삭제 컨트롤러 (브리더 본인 전용).
 *
 * 보류된 PR (PATCH/DELETE /v2/breeder-pet-posting/:petId) 의 백엔드 진입점.
 * cross-field 검증이 복잡한 health/parent/environment 필드는 별도 PR 로 분리한다.
 */
@BreederPetPostingProtectedController()
export class BreederPetPostingUpdateController {
    constructor(
        private readonly updateUseCase: UpdateBreederPetPostingUseCase,
        private readonly deleteUseCase: DeleteBreederPetPostingUseCase,
    ) {}

    @Patch(':petId')
    @ApiUpdateBreederPetPostingEndpoint()
    async update(
        @CurrentUser('userId') userId: string,
        @Param('petId', new MongoObjectIdPipe('분양글')) petId: string,
        @Body() body: UpdateBreederPetPostingRequestDto,
    ): Promise<ApiResponseDto<CreateBreederPetPostingResponseDto>> {
        const result = await this.updateUseCase.execute(userId, petId, body);
        return ApiResponseDto.success({ petId: result.petId }, BREEDER_PET_POSTING_RESPONSE_MESSAGES.updated);
    }

    @Delete(':petId')
    @ApiDeleteBreederPetPostingEndpoint()
    async delete(
        @CurrentUser('userId') userId: string,
        @Param('petId', new MongoObjectIdPipe('분양글')) petId: string,
    ): Promise<ApiResponseDto<BreederPetPostingDeleteResponseDto>> {
        const result = await this.deleteUseCase.execute(userId, petId);
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.deleted);
    }
}
