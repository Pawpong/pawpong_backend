import { AdopterApplicationDetailAssemblerService } from '../../../domain/services/adopter-application-detail-assembler.service';

describe('AdopterApplicationDetailAssemblerService', () => {
    const service = new AdopterApplicationDetailAssemblerService();

    const application = {
        _id: { toString: () => 'app-1' },
        breederId: { toString: () => 'b-1' },
        petId: { toString: () => 'p-1' },
        petName: '초코',
        status: 'pending',
        appliedAt: new Date('2026-01-01T00:00:00.000Z'),
        processedAt: new Date('2026-01-02T00:00:00.000Z'),
        standardResponses: { privacyConsent: true },
        customResponses: [{ questionId: 'q1', answer: 'a' }],
        breederNotes: 'note',
    } as any;

    it('breeder가 있으면 이름을 사용한다', () => {
        const result = service.toResponse(application, { name: '브리더A' } as any);
        expect(result.breederName).toBe('브리더A');
        expect(result.appliedAt).toBe('2026-01-01T00:00:00.000Z');
        expect(result.processedAt).toBe('2026-01-02T00:00:00.000Z');
        expect(result.customResponses).toHaveLength(1);
    });

    it('breeder가 null이면 알 수 없음을 사용한다', () => {
        const result = service.toResponse(application, null);
        expect(result.breederName).toBe('알 수 없음');
    });

    it('processedAt이 없으면 undefined', () => {
        const result = service.toResponse({ ...application, processedAt: undefined }, null);
        expect(result.processedAt).toBeUndefined();
    });

    it('customResponses가 없으면 빈 배열', () => {
        const result = service.toResponse({ ...application, customResponses: undefined }, null);
        expect(result.customResponses).toEqual([]);
    });
});
