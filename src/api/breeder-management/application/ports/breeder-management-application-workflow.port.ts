import { ApplicationStatus } from '../../../../common/enum/user.enum';

export const BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT = Symbol('BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT');

export interface BreederManagementApplicationRecord {
    _id: { toString(): string };
    adopterId: { toString(): string };
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    petId?: { toString(): string } | null;
    petName?: string;
    status: string;
    standardResponses: Record<string, unknown>;
    customResponses?: unknown[];
    appliedAt: Date;
    processedAt?: Date;
    breederNotes?: string;
}

export interface BreederManagementConsultationCompletedNotificationCommand {
    breederId: string;
    adopterId: string;
    applicationId: string;
}

export interface BreederManagementApplicationWorkflowPort {
    findApplicationByIdAndBreeder(
        applicationId: string,
        breederId: string,
    ): Promise<BreederManagementApplicationRecord | null>;
    updateStatus(applicationId: string, status: ApplicationStatus): Promise<void>;
    incrementCompletedAdoptions(breederId: string): Promise<void>;
    notifyConsultationCompleted(command: BreederManagementConsultationCompletedNotificationCommand): Promise<void>;
}
