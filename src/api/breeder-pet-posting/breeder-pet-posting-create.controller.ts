import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';

import { CreateBreederPetPostingUseCase } from './application/use-cases/create-breeder-pet-posting.use-case';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from './constants/breeder-pet-posting-response-messages';
import { BreederPetPostingProtectedController } from './decorator/breeder-pet-posting-protected-controller.decorator';
import { CreateBreederPetPostingRequestDto } from './dto/request/breeder-pet-posting-create-request.dto';
import { CreateBreederPetPostingResponseDto } from './dto/response/breeder-pet-posting-response.dto';
import { ApiCreateBreederPetPostingEndpoint } from './swagger';

/**
 * v2 분양글 작성 컨트롤러 (브리더 전용).
 * Figma 화면 566:30126 / 566:32016 (성공 화면) 의 백엔드 진입점.
 */
@BreederPetPostingProtectedController()
export class BreederPetPostingCreateController {
    constructor(private readonly createUseCase: CreateBreederPetPostingUseCase) {}

    @Post()
    @ApiCreateBreederPetPostingEndpoint()
    async create(
        @CurrentUser('userId') userId: string,
        @Body() body: CreateBreederPetPostingRequestDto,
    ): Promise<ApiResponseDto<CreateBreederPetPostingResponseDto>> {
        const result = await this.createUseCase.execute(userId, body);
        return ApiResponseDto.success({ petId: result.petId }, BREEDER_PET_POSTING_RESPONSE_MESSAGES.created);
    }
}
