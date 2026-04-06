import { Injectable } from '@nestjs/common';

import { StandardQuestionSnapshot } from '../../application/ports/standard-question-reader.port';
import { StandardQuestionResponseDto } from '../../admin/dto/response/standard-question-response.dto';

@Injectable()
export class StandardQuestionPresentationService {
    toResponseDto(question: StandardQuestionSnapshot): StandardQuestionResponseDto {
        return new StandardQuestionResponseDto(question as any);
    }
}
