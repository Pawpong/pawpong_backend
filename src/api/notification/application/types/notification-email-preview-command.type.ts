export interface BreederApprovalEmailPreviewCommand {
    email: string;
    breederName: string;
}

export interface BreederRejectionEmailPreviewCommand extends BreederApprovalEmailPreviewCommand {
    rejectionReasons: string[];
}

export type NewApplicationEmailPreviewCommand = BreederApprovalEmailPreviewCommand;
export type DocumentReminderEmailPreviewCommand = BreederApprovalEmailPreviewCommand;
export type NewReviewEmailPreviewCommand = BreederApprovalEmailPreviewCommand;

export interface ApplicationConfirmationEmailPreviewCommand {
    email: string;
    applicantName: string;
    breederName: string;
}
