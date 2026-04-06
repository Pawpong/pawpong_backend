export interface StandardQuestionSnapshot {
    id: string;
    type: string;
    label: string;
    required: boolean;
    order: number;
    isActive: boolean;
    options?: string[];
    placeholder?: string;
    description?: string;
}

export const STANDARD_QUESTION_READER = Symbol('STANDARD_QUESTION_READER');

export interface StandardQuestionReaderPort {
    readAll(): Promise<StandardQuestionSnapshot[]>;
    readActive(): Promise<StandardQuestionSnapshot[]>;
    findById(id: string): Promise<StandardQuestionSnapshot | null>;
}
