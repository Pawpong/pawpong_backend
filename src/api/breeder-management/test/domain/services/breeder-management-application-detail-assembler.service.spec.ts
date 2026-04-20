import { BreederManagementApplicationDetailAssemblerService } from '../../../domain/services/breeder-management-application-detail-assembler.service';

describe('BreederManagementApplicationDetailAssemblerService', () => {
    const service = new BreederManagementApplicationDetailAssemblerService();

    it('application을 결과로 매핑한다', () => {
        const result = service.toResponse({
            _id: { toString: () => 'app-1' },
            adopterId: { toString: () => 'u-1' },
            adopterName: '입양자',
            adopterEmail: 'a@e.com',
            adopterPhone: '010',
            petId: { toString: () => 'p-1' },
            petName: '초코',
            status: 'pending',
            standardResponses: {},
            customResponses: [{ a: 1 }],
            appliedAt: new Date('2026-01-01T00:00:00.000Z'),
            processedAt: undefined,
            breederNotes: 'notes',
        } as any);
        expect(result.applicationId).toBe('app-1');
        expect(result.appliedAt).toBe('2026-01-01T00:00:00.000Z');
        expect(result.customResponses).toHaveLength(1);
        expect(result.processedAt).toBeUndefined();
    });

    it('customResponses가 없으면 빈 배열', () => {
        const result = service.toResponse({
            _id: { toString: () => 'app-1' },
            adopterId: { toString: () => 'u-1' },
            adopterName: '이름',
            adopterEmail: 'a@e.com',
            adopterPhone: '010',
            status: 'pending',
            standardResponses: {},
            appliedAt: new Date(),
        } as any);
        expect(result.customResponses).toEqual([]);
    });
});
