export type AdopterApplicationBreederNotificationTarget = {
    _id: { toString(): string };
    name?: string;
    nickname?: string;
    emailAddress?: string;
    phoneNumber?: string;
};

export type AdopterApplicationConfirmationTarget = {
    applicantId: string;
    applicantRole: string;
    applicantName: string;
    applicantEmail: string;
    breederName: string;
    /** 알림 클릭 시 신청 상세로 보내기 위해 필요하다. */
    applicationId: string;
};

export const ADOPTER_APPLICATION_NOTIFIER_PORT = Symbol('ADOPTER_APPLICATION_NOTIFIER_PORT');

export interface AdopterApplicationNotifierPort {
    /** applicationId 는 알림 클릭 시 브리더를 받은 신청 상세로 보내는 데 쓴다. */
    notifyBreederOfNewApplication(
        target: AdopterApplicationBreederNotificationTarget,
        applicationId: string,
    ): Promise<void>;
    notifyApplicantApplicationConfirmed(target: AdopterApplicationConfirmationTarget): Promise<void>;
}
