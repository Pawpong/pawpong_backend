export interface StandardQuestionResult {
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
