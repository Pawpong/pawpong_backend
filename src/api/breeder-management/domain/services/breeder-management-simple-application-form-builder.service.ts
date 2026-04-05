import { BadRequestException, Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';

@Injectable()
export class BreederManagementSimpleApplicationFormBuilderService {
    build(questions: Array<{ question: string }>): BreederManagementApplicationFormRecord[] {
        const validQuestions = questions.filter((question) => question.question && question.question.trim().length > 0);

        if (validQuestions.length > 5) {
            throw new BadRequestException('커스텀 질문은 최대 5개까지만 추가할 수 있습니다.');
        }

        const questionTexts = validQuestions.map((question) => question.question.trim().toLowerCase());
        const uniqueQuestions = new Set(questionTexts);

        if (questionTexts.length !== uniqueQuestions.size) {
            throw new BadRequestException('중복된 질문이 있습니다. 각 질문은 고유해야 합니다.');
        }

        const timestamp = Date.now();

        return validQuestions.map((question, index) => ({
            id: `custom_${timestamp}_${index}`,
            type: 'textarea',
            label: question.question.trim(),
            required: false,
            options: undefined,
            placeholder: undefined,
            order: index + 1,
        }));
    }
}
