import { StandardQuestionSnapshot } from '../../../application/ports/standard-question-reader.port';
import { UpdateStandardQuestionDto } from '../../dto/request/update-standard-question.dto';

export const STANDARD_QUESTION_WRITER = Symbol('STANDARD_QUESTION_WRITER');

export interface StandardQuestionReorderCommand {
    id: string;
    order: number;
}

export interface StandardQuestionWriterPort {
    update(id: string, updateData: UpdateStandardQuestionDto): Promise<StandardQuestionSnapshot | null>;
    updateStatus(id: string, isActive: boolean): Promise<StandardQuestionSnapshot | null>;
    reorder(reorderData: StandardQuestionReorderCommand[]): Promise<void>;
    replaceAll(questions: StandardQuestionSnapshot[]): Promise<number>;
}
