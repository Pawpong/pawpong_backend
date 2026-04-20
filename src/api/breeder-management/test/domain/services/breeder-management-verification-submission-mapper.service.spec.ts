import { VerificationStatus } from '../../../../../common/enum/user.enum';
import { BreederManagementVerificationSubmissionMapperService } from '../../../domain/services/breeder-management-verification-submission-mapper.service';

describe('BreederManagementVerificationSubmissionMapperService', () => {
    const service = new BreederManagementVerificationSubmissionMapperService();

    it('status는 REVIEWING, documents는 legacy type으로 매핑', () => {
        const result = service.toVerificationRecord({ plan: 'pro', documents: ['d1.pdf', 'd2.pdf'], submittedByEmail: true } as any);
        expect(result.status).toBe(VerificationStatus.REVIEWING);
        expect(result.plan).toBe('pro');
        expect(result.documents).toEqual([
            { type: 'legacy', fileName: 'd1.pdf' },
            { type: 'legacy', fileName: 'd2.pdf' },
        ]);
        expect(result.submittedByEmail).toBe(true);
    });
});
