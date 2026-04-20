import { AdminTargetType } from '../../../../../../common/enum/user.enum';
import { BreederAdminActivityLogFactoryService } from '../../../domain/services/breeder-admin-activity-log-factory.service';

describe('BreederAdminActivityLogFactoryService', () => {
    const factory = new BreederAdminActivityLogFactoryService();

    it('로그 항목을 생성한다', () => {
        const a = factory.create('approve', AdminTargetType.BREEDER, 'b-1', '브리더', 'reason');
        const b = factory.create('approve', AdminTargetType.BREEDER, 'b-1');
        expect(a.logId).toBeDefined();
        expect(a.logId).not.toBe(b.logId);
        expect(a.description).toBe('reason');
        expect(b.description).toContain('b-1');
    });
});
