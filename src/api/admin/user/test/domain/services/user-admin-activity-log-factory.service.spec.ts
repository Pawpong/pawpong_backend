import { AdminAction, AdminTargetType } from '../../../../../../common/enum/user.enum';
import { UserAdminActivityLogFactoryService } from '../../../domain/services/user-admin-activity-log-factory.service';

describe('UserAdminActivityLogFactoryService', () => {
    const factory = new UserAdminActivityLogFactoryService();

    it('고유 logId와 performedAt을 포함한 엔트리를 생성한다', () => {
        const a = factory.create(AdminAction.ACTIVATE_USER, AdminTargetType.ADOPTER, 'u-1', 'nick', 'desc');
        const b = factory.create(AdminAction.ACTIVATE_USER, AdminTargetType.ADOPTER, 'u-1', 'nick', 'desc');
        expect(a.logId).toBeDefined();
        expect(a.logId).not.toBe(b.logId);
        expect(a.performedAt).toBeInstanceOf(Date);
    });

    it('description이 없으면 기본 문자열을 생성한다', () => {
        const entry = factory.create(AdminAction.SUSPEND_USER, AdminTargetType.BREEDER, 'b-1', '브리더A');
        expect(entry.description).toContain('브리더A');
        expect(entry.description).toContain(AdminAction.SUSPEND_USER);
    });

    it('targetName도 description도 없으면 targetId로 대체한다', () => {
        const entry = factory.create(AdminAction.DELETE_USER, AdminTargetType.ADOPTER, 'u-9');
        expect(entry.description).toContain('u-9');
    });
});
