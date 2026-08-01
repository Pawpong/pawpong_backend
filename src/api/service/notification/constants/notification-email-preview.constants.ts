export const NOTIFICATION_EMAIL_PREVIEW_TYPES = [
    'breeder-approval',
    'breeder-rejection',
    'new-application',
    'document-reminder',
    'application-confirmation',
    'new-review',
] as const;

export type NotificationEmailPreviewType = (typeof NOTIFICATION_EMAIL_PREVIEW_TYPES)[number];

export const NOTIFICATION_EMAIL_PREVIEW_RESPONSE_MESSAGES = {
    breederApprovalSent: '브리더 승인 이메일 테스트 발송 완료',
    breederRejectionSent: '브리더 반려 이메일 테스트 발송 완료',
    newApplicationSent: '새 상담 신청 이메일 테스트 발송 완료',
    documentReminderSent: '서류 미제출 리마인드 이메일 테스트 발송 완료',
    applicationConfirmationSent: '상담 신청 확인 이메일 테스트 발송 완료',
    newReviewSent: '신규 후기 이메일 테스트 발송 완료',
    previewCatalogRetrieved: '모든 이메일 템플릿 미리보기 조회 완료',
} as const;
