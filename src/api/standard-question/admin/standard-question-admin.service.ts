import { Injectable } from '@nestjs/common';

import { StandardQuestionResponseDto } from './dto/response/standard-question-response.dto';
import { StandardQuestionSnapshot } from '../application/ports/standard-question-reader.port';
import { GetAllStandardQuestionsUseCase } from './application/use-cases/get-all-standard-questions.use-case';
import { UpdateStandardQuestionUseCase } from './application/use-cases/update-standard-question.use-case';
import { ToggleStandardQuestionStatusUseCase } from './application/use-cases/toggle-standard-question-status.use-case';
import { ReorderStandardQuestionsUseCase } from './application/use-cases/reorder-standard-questions.use-case';
import { ReseedStandardQuestionsUseCase } from './application/use-cases/reseed-standard-questions.use-case';
import { GetStandardQuestionByIdUseCase } from '../application/use-cases/get-standard-question-by-id.use-case';
import { UpdateStandardQuestionDto } from './dto/request/update-standard-question.dto';

/**
 * 표준 입양 신청 질문 관리 Admin 서비스
 *
 * 역할:
 * - 관리자의 표준 질문 CRUD 관리
 */
@Injectable()
export class StandardQuestionAdminService {
    constructor(
        private readonly getAllStandardQuestionsUseCase: GetAllStandardQuestionsUseCase,
        private readonly updateStandardQuestionUseCase: UpdateStandardQuestionUseCase,
        private readonly toggleStandardQuestionStatusUseCase: ToggleStandardQuestionStatusUseCase,
        private readonly reorderStandardQuestionsUseCase: ReorderStandardQuestionsUseCase,
        private readonly reseedStandardQuestionsUseCase: ReseedStandardQuestionsUseCase,
        private readonly getStandardQuestionByIdUseCase: GetStandardQuestionByIdUseCase,
    ) {}

    /**
     * 모든 표준 질문 조회 (관리자용 - 비활성화 포함)
     * @returns 모든 표준 질문 목록 (DTO 형태)
     */
    async getAllQuestions(): Promise<StandardQuestionResponseDto[]> {
        return this.getAllStandardQuestionsUseCase.execute();
    }

    /**
     * ID로 표준 질문 조회
     * @param id 질문 ID
     * @returns 표준 질문 또는 null
     */
    async getQuestionById(id: string): Promise<StandardQuestionSnapshot | null> {
        return this.getStandardQuestionByIdUseCase.execute(id);
    }

    /**
     * 표준 질문 수정 (관리자 전용)
     * @param id 질문 ID
     * @param updateData 수정할 데이터
     * @returns 수정된 질문 (DTO 형태)
     */
    async updateQuestion(id: string, updateData: UpdateStandardQuestionDto): Promise<StandardQuestionResponseDto> {
        return this.updateStandardQuestionUseCase.execute(id, updateData);
    }

    /**
     * 표준 질문 활성화/비활성화 (관리자 전용)
     * @param id 질문 ID
     * @param isActive 활성화 여부
     * @returns 수정된 질문 (DTO 형태)
     */
    async toggleQuestionStatus(id: string, isActive: boolean): Promise<StandardQuestionResponseDto> {
        return this.toggleStandardQuestionStatusUseCase.execute(id, isActive);
    }

    /**
     * 표준 질문 순서 변경 (관리자 전용)
     * @param reorderData 순서 변경 데이터 배열
     * @returns 성공 메시지
     */
    async reorderQuestions(reorderData: Array<{ id: string; order: number }>): Promise<{ message: string }> {
        return this.reorderStandardQuestionsUseCase.execute(reorderData);
    }

    /**
     * 표준 질문 재시딩 (관리자 전용 - 초기화)
     * @returns 성공 메시지
     */
    async reseedQuestions(): Promise<{ message: string }> {
        return this.reseedStandardQuestionsUseCase.execute();
    }
}
