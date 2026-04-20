import { NotificationType, VerificationStatus } from '../../../../../../common/enum/user.enum';
import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { BreederAdminReminderPolicyService } from '../../../domain/services/breeder-admin-reminder-policy.service';
import { RemindType } from '../../../constants/breeder-remind.enum';

describe('BreederAdminReminderPolicyService', () => {
    const service = new BreederAdminReminderPolicyService();

    it('DOCUMENT_REMINDER에 대한 계획을 반환한다', () => {
        const plan = service.resolve(RemindType.DOCUMENT_REMINDER);
        expect(plan.requiredVerificationStatus).toBe(VerificationStatus.PENDING);
        expect(plan.notificationType).toBe(NotificationType.DOCUMENT_REMINDER);
        expect(plan.emailTemplate).toBe('document_reminder');
    });

    it('PROFILE_COMPLETION_REMINDER에 대한 계획을 반환한다', () => {
        const plan = service.resolve(RemindType.PROFILE_COMPLETION_REMINDER);
        expect(plan.requiredVerificationStatus).toBe(VerificationStatus.APPROVED);
        expect(plan.notificationType).toBe(NotificationType.PROFILE_COMPLETION_REMINDER);
        expect(plan.emailTemplate).toBe('profile_completion_reminder');
    });

    it('알 수 없는 타입은 DomainValidationError', () => {
        expect(() => service.resolve('unknown' as any)).toThrow(DomainValidationError);
    });
});
