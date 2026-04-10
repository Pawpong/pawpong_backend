import { BadRequestException, Injectable } from '@nestjs/common';

import type { BreederManagementApplicationFormRecord } from '../../application/ports/breeder-management-profile.port';
import type { BreederManagementApplicationFormUpdateCommand } from '../../application/types/breeder-management-application-command.type';

@Injectable()
export class BreederManagementApplicationFormValidatorService {
    validateCustomQuestions(updateDto: BreederManagementApplicationFormUpdateCommand, standardQuestionIds: string[]): void {
        const ids = updateDto.customQuestions.map((question) => question.id);
        const uniqueIds = new Set(ids);

        if (ids.length !== uniqueIds.size) {
            throw new BadRequestException('질문 ID가 중복되었습니다.');
        }

        const conflicts = ids.filter((id) => standardQuestionIds.includes(id));
        if (conflicts.length > 0) {
            throw new BadRequestException(`다음 ID는 표준 질문과 중복되어 사용할 수 없습니다: ${conflicts.join(', ')}`);
        }
    }

    toStoredQuestions(updateDto: BreederManagementApplicationFormUpdateCommand): BreederManagementApplicationFormRecord[] {
        return updateDto.customQuestions.map((question) => ({
            id: question.id,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options,
            placeholder: question.placeholder,
            order: question.order,
        }));
    }
}
