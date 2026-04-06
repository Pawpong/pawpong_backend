import { Injectable } from '@nestjs/common';

import { StandardQuestionSnapshot } from './application/ports/standard-question-reader.port';
import { GetAllActiveStandardQuestionsUseCase } from './application/use-cases/get-all-active-standard-questions.use-case';
import { GetStandardQuestionByIdUseCase } from './application/use-cases/get-standard-question-by-id.use-case';

/**
 * 표준 입양 신청 질문 Public 서비스
 *
 * 역할:
 * - 브리더가 사용할 활성화된 표준 질문 제공
 */
@Injectable()
export class StandardQuestionService {
    constructor(
        private readonly getAllActiveStandardQuestionsUseCase: GetAllActiveStandardQuestionsUseCase,
        private readonly getStandardQuestionByIdUseCase: GetStandardQuestionByIdUseCase,
    ) {}

    /**
     * 모든 활성화된 표준 질문 조회 (브리더용)
     * @returns 활성화된 표준 질문 목록
     */
    async getAllActiveQuestions(): Promise<StandardQuestionSnapshot[]> {
        return this.getAllActiveStandardQuestionsUseCase.execute();
    }

    /**
     * ID로 표준 질문 조회
     * @param id 질문 ID
     * @returns 표준 질문 또는 null
     */
    async getQuestionById(id: string): Promise<StandardQuestionSnapshot | null> {
        return this.getStandardQuestionByIdUseCase.execute(id);
    }
}
