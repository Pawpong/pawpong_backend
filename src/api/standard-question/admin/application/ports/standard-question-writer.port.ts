import { StandardQuestionSnapshot } from '../../../application/ports/standard-question-reader.port';
import type { StandardQuestionUpdateCommand } from '../types/standard-question-command.type';

export const STANDARD_QUESTION_WRITER = Symbol('STANDARD_QUESTION_WRITER');

export interface StandardQuestionReorderCommand {
    id: string;
    order: number;
}

export interface StandardQuestionWriterPort {
    update(id: string, updateData: StandardQuestionUpdateCommand): Promise<StandardQuestionSnapshot | null>;
    updateStatus(id: string, isActive: boolean): Promise<StandardQuestionSnapshot | null>;
    reorder(reorderData: StandardQuestionReorderCommand[]): Promise<void>;
    replaceAll(questions: StandardQuestionSnapshot[]): Promise<number>;
}
