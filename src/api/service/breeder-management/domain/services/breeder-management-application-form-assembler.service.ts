import { Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementStandardQuestion } from './breeder-management-standard-question-catalog.service';

@Injectable()
export class BreederManagementApplicationFormAssemblerService {
    toResponse(
        standardQuestions: BreederManagementStandardQuestion[],
        applicationForm: BreederManagementApplicationFormRecord[] | undefined,
    ): {
        standardQuestions: BreederManagementStandardQuestion[];
        customQuestions: Array<BreederManagementApplicationFormRecord & { isStandard: false }>;
        totalQuestions: number;
    } {
        const customQuestions = (applicationForm || []).map((question, index) => ({
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options,
            placeholder: question.placeholder,
            order: standardQuestions.length + index + 1,
            isStandard: false as const,
        }));

        return {
            standardQuestions,
            customQuestions,
            totalQuestions: standardQuestions.length + customQuestions.length,
        };
    }
}
