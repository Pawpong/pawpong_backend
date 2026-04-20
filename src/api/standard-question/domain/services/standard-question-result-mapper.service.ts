import { Injectable } from '@nestjs/common';

import { StandardQuestionSnapshot } from '../../application/ports/standard-question-reader.port';
import type { StandardQuestionResult } from '../../admin/application/types/standard-question-result.type';

@Injectable()
export class StandardQuestionResultMapperService {
    toResult(question: StandardQuestionSnapshot): StandardQuestionResult {
        return {
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            order: question.order,
            isActive: question.isActive,
            options: question.options,
            placeholder: question.placeholder,
            description: question.description,
        };
    }
}
