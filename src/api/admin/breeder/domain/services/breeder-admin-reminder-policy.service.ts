import { Injectable } from '@nestjs/common';

import { NotificationType, VerificationStatus } from '../../../../../common/enum/user.enum';
import { DomainValidationError } from '../../../../../common/error/domain.error';
import { BreederAdminReminderEmailTemplate } from '../../application/ports/breeder-admin-notifier.port';
import { RemindType } from '../../constants/breeder-remind.enum';

export interface BreederAdminReminderPlan {
    requiredVerificationStatus: VerificationStatus;
    notificationType: NotificationType;
    title: string;
    content: string;
    targetUrl: string;
    activityDescription: string;
    emailTemplate: BreederAdminReminderEmailTemplate;
}

@Injectable()
export class BreederAdminReminderPolicyService {
    resolve(remindType: RemindType): BreederAdminReminderPlan {
        switch (remindType) {
            case RemindType.DOCUMENT_REMINDER:
                return {
                    requiredVerificationStatus: VerificationStatus.PENDING,
                    notificationType: NotificationType.DOCUMENT_REMINDER,
                    title: '📄 브리더 입점 절차가 아직 완료되지 않았어요!',
                    content: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
                    targetUrl: '/profile/documents',
                    activityDescription: 'Sent document submission reminder',
                    emailTemplate: 'document_reminder',
                };
            case RemindType.PROFILE_COMPLETION_REMINDER:
                return {
                    requiredVerificationStatus: VerificationStatus.APPROVED,
                    notificationType: NotificationType.PROFILE_COMPLETION_REMINDER,
                    title: '📝 브리더 프로필이 아직 완성되지 않았어요!',
                    content: '프로필 작성을 마무리하면 입양자에게 노출되고 상담을 받을 수 있어요.',
                    targetUrl: '/profile',
                    activityDescription: 'Sent profile completion reminder',
                    emailTemplate: 'profile_completion_reminder',
                };
            default:
                throw new DomainValidationError('올바른 리마인드 타입을 선택해주세요.');
        }
    }
}
