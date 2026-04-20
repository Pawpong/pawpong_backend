import { AdopterAdminApplicationDetailMapperService } from '../../../domain/services/adopter-admin-application-detail-mapper.service';

describe('AdopterAdminApplicationDetailMapperService', () => {
    const service = new AdopterAdminApplicationDetailMapperService();

    it('상세 스냅샷을 결과로 매핑한다', () => {
        const snapshot = {
            applicationId: 'app-1',
            adopterName: '입양자',
            adopterEmail: 'a@b.com',
            adopterPhone: '010-0000-0000',
            breederId: 'b-1',
            breederName: '브리더',
            petName: '초코',
            status: 'pending',
            standardResponses: { privacyConsent: true } as any,
            customResponses: [{ questionId: 'q1', answer: 'a' }],
            appliedAt: new Date('2026-01-01'),
            processedAt: undefined,
            breederNotes: 'notes',
        } as any;
        expect(service.toResult(snapshot)).toEqual(snapshot);
    });
});
