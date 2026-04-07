import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorator/roles.decorator';
import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { UpdateStandardQuestionDto } from './dto/request/update-standard-question.dto';
import { StandardQuestionResponseDto } from './dto/response/standard-question-response.dto';
import { ReorderStandardQuestionsDto } from './dto/request/reorder-standard-questions.dto';
import { ToggleStandardQuestionStatusDto } from './dto/request/toggle-standard-question-status.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllStandardQuestionsUseCase } from './application/use-cases/get-all-standard-questions.use-case';
import { ReorderStandardQuestionsUseCase } from './application/use-cases/reorder-standard-questions.use-case';
import { ReseedStandardQuestionsUseCase } from './application/use-cases/reseed-standard-questions.use-case';
import { ToggleStandardQuestionStatusUseCase } from './application/use-cases/toggle-standard-question-status.use-case';
import { UpdateStandardQuestionUseCase } from './application/use-cases/update-standard-question.use-case';
import {
    ApiGetAllStandardQuestionsAdminEndpoint,
    ApiReorderStandardQuestionsAdminEndpoint,
    ApiReseedStandardQuestionsAdminEndpoint,
    ApiStandardQuestionAdminController,
    ApiToggleStandardQuestionStatusAdminEndpoint,
    ApiUpdateStandardQuestionAdminEndpoint,
} from './swagger';

/**
 * 표준 질문 Admin 컨트롤러
 *
 * 표준 입양 신청 질문 관리 관리자 기능을 제공합니다:
 * - 표준 질문 조회 (비활성화 포함)
 * - 표준 질문 수정
 * - 표준 질문 활성화/비활성화
 * - 표준 질문 순서 변경
 * - 표준 질문 재시딩
 */
@ApiStandardQuestionAdminController()
@Controller('standard-question-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StandardQuestionAdminController {
    constructor(
        private readonly getAllStandardQuestionsUseCase: GetAllStandardQuestionsUseCase,
        private readonly updateStandardQuestionUseCase: UpdateStandardQuestionUseCase,
        private readonly toggleStandardQuestionStatusUseCase: ToggleStandardQuestionStatusUseCase,
        private readonly reorderStandardQuestionsUseCase: ReorderStandardQuestionsUseCase,
        private readonly reseedStandardQuestionsUseCase: ReseedStandardQuestionsUseCase,
    ) {}

    @Get()
    @ApiGetAllStandardQuestionsAdminEndpoint()
    async getAllStandardQuestions(): Promise<ApiResponseDto<StandardQuestionResponseDto[]>> {
        const result = await this.getAllStandardQuestionsUseCase.execute();
        return ApiResponseDto.success(result, '표준 질문 목록이 조회되었습니다.');
    }

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
