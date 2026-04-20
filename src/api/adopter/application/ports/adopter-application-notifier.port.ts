export type AdopterApplicationBreederNotificationTarget = {
    _id: { toString(): string };
    name?: string;
    nickname?: string;
    emailAddress?: string;
};

export type AdopterApplicationConfirmationTarget = {
    applicantId: string;
    applicantRole: string;
    applicantName: string;
    applicantEmail: string;
    breederName: string;
};

export const ADOPTER_APPLICATION_NOTIFIER_PORT = Symbol('ADOPTER_APPLICATION_NOTIFIER_PORT');

export interface AdopterApplicationNotifierPort {
    notifyBreederOfNewApplication(target: AdopterApplicationBreederNotificationTarget): Promise<void>;
    notifyApplicantApplicationConfirmed(target: AdopterApplicationConfirmationTarget): Promise<void>;
}
