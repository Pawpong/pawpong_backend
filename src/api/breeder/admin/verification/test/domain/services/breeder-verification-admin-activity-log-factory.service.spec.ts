import { AdminAction, AdminTargetType } from '../../../../../../../common/enum/user.enum';
import { BreederVerificationAdminActivityLogFactoryService } from '../../../domain/services/breeder-verification-admin-activity-log-factory.service';

describe('BreederVerificationAdminActivityLogFactoryService', () => {
    const factory = new BreederVerificationAdminActivityLogFactoryService();

    it('고유 logId와 description fallback', () => {
        const a = factory.create(AdminAction.APPROVE_BREEDER, AdminTargetType.BREEDER, 'b-1', '이름');
        const b = factory.create(AdminAction.APPROVE_BREEDER, AdminTargetType.BREEDER, 'b-1');
        expect(a.logId).not.toBe(b.logId);
        expect(a.description).toContain('이름');
    });
});
