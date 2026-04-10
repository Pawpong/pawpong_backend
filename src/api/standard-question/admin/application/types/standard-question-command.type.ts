export type StandardQuestionUpdateCommand = {
    type?: string;
    label?: string;
    required?: boolean;
    options?: string[];
    placeholder?: string;
    description?: string;
};
