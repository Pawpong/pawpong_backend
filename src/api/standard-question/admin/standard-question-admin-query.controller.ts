import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllStandardQuestionsUseCase } from './application/use-cases/get-all-standard-questions.use-case';
import type { StandardQuestionResult } from './application/types/standard-question-result.type';
import { STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/standard-question-admin-response-messages';
import { StandardQuestionAdminProtectedController } from './decorator/standard-question-admin-controller.decorator';
import { StandardQuestionResponseDto } from './dto/response/standard-question-response.dto';
import { ApiGetAllStandardQuestionsAdminEndpoint } from './swagger';

@StandardQuestionAdminProtectedController()
export class StandardQuestionAdminQueryController {
    constructor(private readonly getAllStandardQuestionsUseCase: GetAllStandardQuestionsUseCase) {}

    @Get()
    @ApiGetAllStandardQuestionsAdminEndpoint()
    async getAllStandardQuestions(): Promise<ApiResponseDto<StandardQuestionResponseDto[]>> {
        const result = await this.getAllStandardQuestionsUseCase.execute();
        return ApiResponseDto.success(
            result as Array<StandardQuestionResponseDto & StandardQuestionResult>,
            STANDARD_QUESTION_ADMIN_RESPONSE_MESSAGE_EXAMPLES.standardQuestionsRetrieved,
        );
    }
}
