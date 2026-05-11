import { Body, Post } from '@nestjs/common';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';

import { CreateAdoptionApplicationV2UseCase } from './application/use-cases/create-adoption-application-v2.use-case';
import { ADOPTION_APPLICATION_RESPONSE_MESSAGES } from './constants/adoption-application-response-messages';
import { AdoptionApplicationProtectedController } from './decorator/adoption-application-protected-controller.decorator';
import { CreateAdoptionApplicationRequestDto } from './dto/request/create-adoption-application-request.dto';
import { CreateAdoptionApplicationResponseDto } from './dto/response/create-adoption-application-response.dto';
import { ApiCreateAdoptionApplicationEndpoint } from './swagger';

/**
 * POST /v2/adoption-application — 입양 신청서 제출 (Figma 122:3).
 */
@AdoptionApplicationProtectedController()
export class AdoptionApplicationCreateController {
    constructor(private readonly useCase: CreateAdoptionApplicationV2UseCase) {}

    @Post()
    @ApiCreateAdoptionApplicationEndpoint()
    async create(
        @CurrentUser('userId') userId: string,
        @Body() body: CreateAdoptionApplicationRequestDto,
    ): Promise<ApiResponseDto<CreateAdoptionApplicationResponseDto>> {
        const result = await this.useCase.execute({
            adopterId: userId,
            petId: body.petId,
            adoptionPlan: body.adoptionPlan,
            familyMembers: body.familyMembers,
            privacyConsent: body.privacyConsent,
            basicCareConsent: body.basicCareConsent,
            emergencyCareConsent: body.emergencyCareConsent,
            allFamilyConsent: body.allFamilyConsent,
        });
        return ApiResponseDto.success(result, ADOPTION_APPLICATION_RESPONSE_MESSAGES.created);
    }
}
