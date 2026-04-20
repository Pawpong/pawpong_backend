import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';
import { AdopterAdminActivityLogFactoryService } from '../../../domain/services/adopter-admin-activity-log-factory.service';

describe('AdopterAdminActivityLogFactoryService', () => {
    const factory = new AdopterAdminActivityLogFactoryService();

    it('고유 logId와 performedAt, description을 생성한다', () => {
        const entry = factory.create(AdminAction.SUSPEND_USER, AdminTargetType.ADOPTER, 'u-1', '이름', 'reason');
        expect(entry.logId).toBeDefined();
        expect(entry.performedAt).toBeInstanceOf(Date);
        expect(entry.description).toBe('reason');
    });

    it('description이 없으면 기본 문구를 생성한다', () => {
        const entry = factory.create(AdminAction.REVIEW_BREEDER, AdminTargetType.BREEDER, 'b-1');
        expect(entry.description).toContain('b-1');
    });
});
