import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';
import { AdopterApplicationCustomResponseRecord } from '../../application/ports/adopter-application-command.port';
import type { AdopterApplicationCreateCommand } from '../../application/types/adopter-application-command.type';
import type { AdopterApplicationCustomQuestionRecord } from '../../types/adopter-application.type';

@Injectable()
export class AdopterApplicationCustomAnswerBuilderService {
    build(
        dto: AdopterApplicationCreateCommand,
        customQuestions: AdopterApplicationCustomQuestionRecord[] = [],
    ): AdopterApplicationCustomResponseRecord[] {
        return (dto.customResponses || []).map((response) => {
            const question = customQuestions.find((item) => item.id === response.questionId);
            if (!question) {
                throw new DomainValidationError(`존재하지 않는 질문 ID입니다: ${response.questionId}`);
            }

            if (response.answer === undefined || response.answer === null) {
                throw new DomainValidationError(
                    `질문 "${question.label}"에 대한 답변이 필요합니다. (questionId: ${response.questionId})`,
                );
            }

            return {
                questionId: response.questionId,
                questionLabel: question.label,
                questionType: question.type,
                answer: response.answer,
            };
        });
    }
}
