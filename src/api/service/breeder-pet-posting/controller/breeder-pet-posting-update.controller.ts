import { Body, Delete, Get, Param, Patch } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';

import { DeleteBreederPetPostingUseCase } from '../application/use-cases/delete-breeder-pet-posting.use-case';
import { GetBreederPetPostingForEditUseCase } from '../application/use-cases/get-breeder-pet-posting-for-edit.use-case';
import { UpdateBreederPetPostingUseCase } from '../application/use-cases/update-breeder-pet-posting.use-case';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from '../constants/breeder-pet-posting-response-messages';
import { BreederPetPostingProtectedController } from '../decorator/breeder-pet-posting-protected-controller.decorator';
import { UpdateBreederPetPostingRequestDto } from '../dto/request/breeder-pet-posting-update-request.dto';
import { BreederPetPostingDeleteResponseDto } from '../dto/response/breeder-pet-posting-delete-response.dto';
import { BreederPetPostingEditDetailResponseDto } from '../dto/response/breeder-pet-posting-edit-response.dto';
import { CreateBreederPetPostingResponseDto } from '../dto/response/breeder-pet-posting-response.dto';
import {
    ApiDeleteBreederPetPostingEndpoint,
    ApiGetBreederPetPostingForEditEndpoint,
    ApiUpdateBreederPetPostingEndpoint,
} from '../swagger/index';

/**
 * v2 분양글 수정 화면 컨트롤러 (브리더 본인 전용).
 * GET/PATCH/DELETE /v2/breeder-pet-posting/:petId — 폼 복원, 부분 수정, soft delete.
 *
 * 라우트 등록 순서 주의: 본 컨트롤러의 GET :petId 는 한 세그먼트를 모두 잡아먹으므로
 * 리터럴 경로(GET me, GET drafts)를 가진 List/Draft 컨트롤러보다 **뒤에** 등록해야 한다.
 * (breeder-pet-posting.module-definition.ts 의 controllers 배열 순서로 보장한다)
 */
@BreederPetPostingProtectedController()
export class BreederPetPostingUpdateController {
    constructor(
        private readonly getForEditUseCase: GetBreederPetPostingForEditUseCase,
        private readonly updateUseCase: UpdateBreederPetPostingUseCase,
        private readonly deleteUseCase: DeleteBreederPetPostingUseCase,
    ) {}

    @Get(':petId')
    @ApiGetBreederPetPostingForEditEndpoint()
    async detailForEdit(
        @CurrentUser('userId') userId: string,
        @Param('petId', new MongoObjectIdPipe('분양글')) petId: string,
    ): Promise<ApiResponseDto<BreederPetPostingEditDetailResponseDto>> {
        const result = await this.getForEditUseCase.execute(userId, petId);
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.retrievedForEdit);
    }

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
