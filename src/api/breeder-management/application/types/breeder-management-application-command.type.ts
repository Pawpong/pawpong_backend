import { ApplicationStatus } from '../../../../common/enum/user.enum';

export type BreederManagementCustomQuestionCommand = {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    order: number;
};

export type BreederManagementApplicationFormUpdateCommand = {
    customQuestions: BreederManagementCustomQuestionCommand[];
};

export type BreederManagementApplicationStatusUpdateCommand = {
    applicationId: string;
    status: ApplicationStatus;
    notes?: string;
    actionTaken?: string;
    nextSteps?: string;
};
