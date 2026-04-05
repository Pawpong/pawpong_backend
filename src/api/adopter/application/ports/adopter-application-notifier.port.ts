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

export abstract class AdopterApplicationNotifierPort {
    abstract notifyBreederOfNewApplication(target: AdopterApplicationBreederNotificationTarget): Promise<void>;
    abstract notifyApplicantApplicationConfirmed(target: AdopterApplicationConfirmationTarget): Promise<void>;
}
