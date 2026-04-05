import { BadRequestException, Injectable } from '@nestjs/common';

import { ApplicationCreateRequestDto } from '../../dto/request/application-create-request.dto';
import { AdopterApplicationCustomResponseRecord } from '../../application/ports/adopter-application-command.port';

@Injectable()
export class AdopterApplicationCustomResponseBuilderService {
    build(dto: ApplicationCreateRequestDto, customQuestions: any[] = []): AdopterApplicationCustomResponseRecord[] {
        return (dto.customResponses || []).map((response) => {
            const question = customQuestions.find((item) => item.id === response.questionId);
            if (!question) {
                throw new BadRequestException(`존재하지 않는 질문 ID입니다: ${response.questionId}`);
            }

            if (response.answer === undefined || response.answer === null) {
                throw new BadRequestException(
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
