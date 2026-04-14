import { NotificationType } from '../../../common/enum/user.enum';

export const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
    [NotificationType.PROFILE_REVIEW]: {
        title: '프로필 심사 중입니다',
        body: '프로필 심사가 진행 중입니다. 잠시만 기다려주세요.',
    },
    [NotificationType.PROFILE_RE_REVIEW]: {
        title: '프로필 재심사가 필요합니다',
        body: '프로필을 다시 확인해주세요.',
    },
    [NotificationType.MATCHING]: {
        title: '새로운 매칭이 있습니다',
        body: '매칭 결과를 확인해보세요.',
    },
    [NotificationType.BREEDER_APPROVED]: {
        title: '포퐁 브리더 입점이 승인되었습니다!',
        body: '지금 프로필을 세팅하고 아이들 정보를 등록해 보세요.',
    },
    [NotificationType.BREEDER_REJECTED]: {
        title: '🐾 브리더 입점 심사 결과, 보완이 필요합니다.',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.BREEDER_UNAPPROVED]: {
        title: '🐾 브리더 입점 심사 결과, 보완이 필요합니다.',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.BREEDER_ONBOARDING_INCOMPLETE]: {
        title: '브리더 입점 절차가 아직 완료되지 않았어요!',
        body: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
    },
    [NotificationType.BREEDER_SUSPENDED]: {
        title: '브리더 계정이 정지되었습니다',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.NEW_CONSULT_REQUEST]: {
        title: '새로운 입양 상담 신청이 도착했어요!',
        body: '지금 확인해 보세요.',
    },
    [NotificationType.CONSULT_REQUEST_CONFIRMED]: {
        title: '상담 신청이 접수되었습니다!',
        body: '{breederName}님이 확인 후 연락드릴 예정입니다.',
    },
    [NotificationType.CONSULT_COMPLETED]: {
        title: '{breederName}님과의 상담이 완료되었어요!',
        body: '어떠셨는지 후기를 남겨주세요.',
    },
    [NotificationType.DOCUMENT_REMINDER]: {
        title: '📄 브리더 입점 절차가 아직 완료되지 않았어요!',
        body: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
    },
    [NotificationType.PROFILE_COMPLETION_REMINDER]: {
        title: '📝 브리더 프로필이 아직 완성되지 않았어요!',
        body: '프로필 작성을 마무리하면 입양자에게 노출되고 상담을 받을 수 있어요.',
    },
    [NotificationType.NEW_REVIEW_REGISTERED]: {
        title: '⭐ 새로운 후기가 등록되었어요!',
        body: '브리더 프로필에서 후기를 확인해 보세요.',
    },
    [NotificationType.NEW_PET_REGISTERED]: {
        title: '{breederName}님이 새로운 아이를 등록했어요!',
        body: '지금 바로 확인해보세요.',
    },
};
