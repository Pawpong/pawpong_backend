import { Body, Param, Patch, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { ReorderStandardQuestionsUseCase } from './application/use-cases/reorder-standard-questions.use-case';
import { ReseedStandardQuestionsUseCase } from './application/use-cases/reseed-standard-questions.use-case';
import { ToggleStandardQuestionStatusUseCase } from './application/use-cases/toggle-standard-question-status.use-case';
import { UpdateStandardQuestionUseCase } from './application/use-cases/update-standard-question.use-case';
import { StandardQuestionAdminProtectedController } from './decorator/standard-question-admin-controller.decorator';
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
    ) {}

    @Patch(':id')
    @ApiUpdateStandardQuestionAdminEndpoint()
    async updateStandardQuestion(
        @Param('id') id: string,
        @Body() updateData: UpdateStandardQuestionDto,
    ): Promise<ApiResponseDto<StandardQuestionResponseDto>> {
        const result = await this.updateStandardQuestionUseCase.execute(id, updateData);
        return ApiResponseDto.success(result, '표준 질문이 수정되었습니다.');
    }

    @Patch(':id/status')
    @ApiToggleStandardQuestionStatusAdminEndpoint()
    async toggleStandardQuestionStatus(
        @Param('id') id: string,
        @Body() statusData: ToggleStandardQuestionStatusDto,
    ): Promise<ApiResponseDto<StandardQuestionResponseDto>> {
        const result = await this.toggleStandardQuestionStatusUseCase.execute(id, statusData.isActive);
        return ApiResponseDto.success(result, '표준 질문 상태가 변경되었습니다.');
    }

    @Post('reorder')
    @ApiReorderStandardQuestionsAdminEndpoint()
    async reorderStandardQuestions(
        @Body() reorderData: ReorderStandardQuestionsDto,
    ): Promise<ApiResponseDto<boolean>> {
        await this.reorderStandardQuestionsUseCase.execute(reorderData.reorderData);
        return ApiResponseDto.success(true, '표준 질문 순서가 변경되었습니다.');
    }

    @Post('reseed')
    @ApiReseedStandardQuestionsAdminEndpoint()
    async reseedStandardQuestions(): Promise<ApiResponseDto<boolean>> {
        await this.reseedStandardQuestionsUseCase.execute();
        return ApiResponseDto.success(true, '표준 질문이 재시딩되었습니다.');
    }
}
