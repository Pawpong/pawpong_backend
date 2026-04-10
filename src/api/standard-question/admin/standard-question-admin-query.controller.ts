import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllStandardQuestionsUseCase } from './application/use-cases/get-all-standard-questions.use-case';
import type { StandardQuestionResult } from './application/types/standard-question-result.type';
import { StandardQuestionAdminProtectedController } from './decorator/standard-question-admin-controller.decorator';
import { StandardQuestionAdminQueryResponseMessageService } from './domain/services/standard-question-admin-query-response-message.service';
import { StandardQuestionResponseDto } from './dto/response/standard-question-response.dto';
import { ApiGetAllStandardQuestionsAdminEndpoint } from './swagger';

@StandardQuestionAdminProtectedController()
export class StandardQuestionAdminQueryController {
    constructor(
        private readonly getAllStandardQuestionsUseCase: GetAllStandardQuestionsUseCase,
        private readonly standardQuestionAdminQueryResponseMessageService: StandardQuestionAdminQueryResponseMessageService,
    ) {}

    @Get()
    @ApiGetAllStandardQuestionsAdminEndpoint()
    async getAllStandardQuestions(): Promise<ApiResponseDto<StandardQuestionResponseDto[]>> {
        const result = await this.getAllStandardQuestionsUseCase.execute();
        return ApiResponseDto.success(
            result as Array<StandardQuestionResponseDto & StandardQuestionResult>,
            this.standardQuestionAdminQueryResponseMessageService.standardQuestionsRetrieved(),
        );
    }
}
