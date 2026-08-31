import { Body, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { MongoObjectIdPipe } from '../../../../common/pipe/mongo-object-id.pipe';

import { DeleteBreederPetPostingDraftUseCase } from '../application/use-cases/delete-breeder-pet-posting-draft.use-case';
import { GetBreederPetPostingDraftUseCase } from '../application/use-cases/get-breeder-pet-posting-draft.use-case';
import { ListMyBreederPetPostingDraftsUseCase } from '../application/use-cases/list-my-breeder-pet-posting-drafts.use-case';
import { SaveBreederPetPostingDraftUseCase } from '../application/use-cases/save-breeder-pet-posting-draft.use-case';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from '../constants/breeder-pet-posting-response-messages';
import { BreederPetPostingProtectedController } from '../decorator/breeder-pet-posting-protected-controller.decorator';
import { SaveBreederPetPostingDraftRequestDto } from '../dto/request/breeder-pet-posting-draft-save-request.dto';
import {
    BreederPetPostingDraftCardResponseDto,
    BreederPetPostingDraftDetailResponseDto,
    DeleteBreederPetPostingDraftResponseDto,
    SaveBreederPetPostingDraftResponseDto,
} from '../dto/response/breeder-pet-posting-draft-response.dto';
import {
    ApiDeleteBreederPetPostingDraftEndpoint,
    ApiGetBreederPetPostingDraftEndpoint,
    ApiListMyBreederPetPostingDraftsEndpoint,
    ApiSaveBreederPetPostingDraftEndpoint,
    ApiUpdateBreederPetPostingDraftEndpoint,
} from '../swagger/index';

/**
 * v2 분양글 임시저장 컨트롤러 (브리더 전용).
 * 작성 중인 폼 상태의 저장/복원/삭제를 담당한다.
 */
@BreederPetPostingProtectedController()
export class BreederPetPostingDraftController {
    constructor(
        private readonly saveUseCase: SaveBreederPetPostingDraftUseCase,
        private readonly listUseCase: ListMyBreederPetPostingDraftsUseCase,
        private readonly getUseCase: GetBreederPetPostingDraftUseCase,
        private readonly deleteUseCase: DeleteBreederPetPostingDraftUseCase,
    ) {}

    @Post('drafts')
    @HttpCode(HttpStatus.OK)
    @ApiSaveBreederPetPostingDraftEndpoint()
    async save(
        @CurrentUser('userId') userId: string,
        @Body() body: SaveBreederPetPostingDraftRequestDto,
    ): Promise<ApiResponseDto<SaveBreederPetPostingDraftResponseDto>> {
        const result = await this.saveUseCase.execute(userId, null, { ...body });
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftSaved);
    }

    @Put('drafts/:draftId')
    @HttpCode(HttpStatus.OK)
    @ApiUpdateBreederPetPostingDraftEndpoint()
    async update(
        @CurrentUser('userId') userId: string,
        @Param('draftId', new MongoObjectIdPipe('임시저장 글')) draftId: string,
        @Body() body: SaveBreederPetPostingDraftRequestDto,
    ): Promise<ApiResponseDto<SaveBreederPetPostingDraftResponseDto>> {
        const result = await this.saveUseCase.execute(userId, draftId, { ...body });
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftSaved);
    }

    @Get('drafts')
    @ApiListMyBreederPetPostingDraftsEndpoint()
    async list(
        @CurrentUser('userId') userId: string,
    ): Promise<ApiResponseDto<BreederPetPostingDraftCardResponseDto[]>> {
        const result = await this.listUseCase.execute(userId);
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftListRetrieved);
    }

    @Get('drafts/:draftId')
    @ApiGetBreederPetPostingDraftEndpoint()
    async detail(
        @CurrentUser('userId') userId: string,
        @Param('draftId', new MongoObjectIdPipe('임시저장 글')) draftId: string,
    ): Promise<ApiResponseDto<BreederPetPostingDraftDetailResponseDto>> {
        const result = await this.getUseCase.execute(userId, draftId);
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftRetrieved);
    }

    @Delete('drafts/:draftId')
    @ApiDeleteBreederPetPostingDraftEndpoint()
    async remove(
        @CurrentUser('userId') userId: string,
        @Param('draftId', new MongoObjectIdPipe('임시저장 글')) draftId: string,
    ): Promise<ApiResponseDto<DeleteBreederPetPostingDraftResponseDto>> {
        const result = await this.deleteUseCase.execute(userId, draftId);
        return ApiResponseDto.success(result, BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftDeleted);
    }
}
