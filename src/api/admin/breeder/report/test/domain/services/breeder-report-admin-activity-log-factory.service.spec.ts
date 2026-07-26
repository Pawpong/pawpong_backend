import { AdminAction, AdminTargetType } from '../../../../../../../common/enum/user.enum';
import { BreederReportAdminActivityLogFactoryService } from '../../../domain/services/breeder-report-admin-activity-log-factory.service';

describe('BreederReportAdminActivityLogFactoryService', () => {
    const factory = new BreederReportAdminActivityLogFactoryService();

    it('targetType=BREEDER로 고정되고 description은 그대로', () => {
        const entry = factory.create(AdminAction.RESOLVE_REPORT, 'b-1', '브리더', '신고 처리');
        expect(entry.targetType).toBe(AdminTargetType.BREEDER);
        expect(entry.description).toBe('신고 처리');
        expect(entry.logId).toBeDefined();
    });
});
