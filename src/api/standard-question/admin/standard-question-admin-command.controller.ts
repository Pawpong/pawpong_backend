import { Body, Param, Patch, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ReorderStandardQuestionsUseCase } from './application/use-cases/reorder-standard-questions.use-case';
import { ReseedStandardQuestionsUseCase } from './application/use-cases/reseed-standard-questions.use-case';
import { ToggleStandardQuestionStatusUseCase } from './application/use-cases/toggle-standard-question-status.use-case';
import { UpdateStandardQuestionUseCase } from './application/use-cases/update-standard-question.use-case';
import { StandardQuestionAdminProtectedController } from './decorator/standard-question-admin-controller.decorator';
import { StandardQuestionAdminResponseMessageService } from './domain/services/standard-question-admin-response-message.service';
import { ReorderStandardQuestionsDto } from './dto/request/reorder-standard-questions.dto';
import { ToggleStandardQuestionStatusDto } from './dto/request/toggle-standard-question-status.dto';
import { UpdateStandardQuestionDto } from './dto/request/update-standard-question.dto';
import { StandardQuestionResponseDto } from './dto/response/standard-question-response.dto';
import {
    ApiReorderStandardQuestionsAdminEndpoint,
    ApiReseedStandardQuestionsAdminEndpoint,
    ApiToggleStandardQuestionStatusAdminEndpoint,
    ApiUpdateStandardQuestionAdminEndpoint,
} from './swagger';

@StandardQuestionAdminProtectedController()
export class StandardQuestionAdminCommandController {
    constructor(
        private readonly updateStandardQuestionUseCase: UpdateStandardQuestionUseCase,
        private readonly toggleStandardQuestionStatusUseCase: ToggleStandardQuestionStatusUseCase,
        private readonly reorderStandardQuestionsUseCase: ReorderStandardQuestionsUseCase,
        private readonly reseedStandardQuestionsUseCase: ReseedStandardQuestionsUseCase,
        private readonly standardQuestionAdminResponseMessageService: StandardQuestionAdminResponseMessageService,
    ) {}

    @Patch(':id')
    @ApiUpdateStandardQuestionAdminEndpoint()
    async updateStandardQuestion(
        @Param('id') id: string,
        @Body() updateData: UpdateStandardQuestionDto,
    ): Promise<ApiResponseDto<StandardQuestionResponseDto>> {
        const result = await this.updateStandardQuestionUseCase.execute(id, updateData);
        return ApiResponseDto.success(
            result,
            this.standardQuestionAdminResponseMessageService.standardQuestionUpdated(),
        );
    }

    @Patch(':id/status')
    @ApiToggleStandardQuestionStatusAdminEndpoint()
    async toggleStandardQuestionStatus(
        @Param('id') id: string,
        @Body() statusData: ToggleStandardQuestionStatusDto,
    ): Promise<ApiResponseDto<StandardQuestionResponseDto>> {
        const result = await this.toggleStandardQuestionStatusUseCase.execute(id, statusData.isActive);
        return ApiResponseDto.success(
            result,
            this.standardQuestionAdminResponseMessageService.standardQuestionStatusUpdated(),
        );
    }

    @Post('reorder')
    @ApiReorderStandardQuestionsAdminEndpoint()
    async reorderStandardQuestions(
        @Body() reorderData: ReorderStandardQuestionsDto,
    ): Promise<ApiResponseDto<boolean>> {
        await this.reorderStandardQuestionsUseCase.execute(reorderData.reorderData);
        return ApiResponseDto.success(
            true,
            this.standardQuestionAdminResponseMessageService.standardQuestionsReordered(),
        );
    }

    @Post('reseed')
    @ApiReseedStandardQuestionsAdminEndpoint()
    async reseedStandardQuestions(): Promise<ApiResponseDto<boolean>> {
        await this.reseedStandardQuestionsUseCase.execute();
        return ApiResponseDto.success(
            true,
            this.standardQuestionAdminResponseMessageService.standardQuestionsReseeded(),
        );
    }
}
