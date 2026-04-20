import { AdopterApplicationCreateResultMapperService } from '../../../domain/services/adopter-application-create-result-mapper.service';

describe('AdopterApplicationCreateResultMapperService', () => {
    const service = new AdopterApplicationCreateResultMapperService();

    it('저장된 application을 결과로 매핑한다', () => {
        const saved = {
            _id: { toString: () => 'app-1' },
            breederId: { toString: () => 'b-1' },
            petId: { toString: () => 'p-1' },
            status: 'pending',
            appliedAt: new Date('2026-01-01T00:00:00.000Z'),
        } as any;
        const result = service.toResult(saved, '브리더A', '초코');
        expect(result.applicationId).toBe('app-1');
        expect(result.breederId).toBe('b-1');
        expect(result.petId).toBe('p-1');
        expect(result.breederName).toBe('브리더A');
        expect(result.petName).toBe('초코');
        expect(result.appliedAt).toBe('2026-01-01T00:00:00.000Z');
        expect(result.message).toContain('성공적으로');
    });

    it('petId가 없으면 undefined', () => {
        const saved = {
            _id: { toString: () => 'app-1' },
            breederId: { toString: () => 'b-1' },
            status: 'pending',
            appliedAt: new Date(),
        } as any;
        const result = service.toResult(saved, 'X');
        expect(result.petId).toBeUndefined();
    });
});
