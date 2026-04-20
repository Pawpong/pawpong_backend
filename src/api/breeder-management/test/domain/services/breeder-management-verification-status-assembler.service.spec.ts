import { BreederManagementVerificationStatusAssemblerService } from '../../../domain/services/breeder-management-verification-status-assembler.service';

const fileUrlPort = {
    generateOne: jest.fn((name: string) => `https://cdn/${name}`),
    generateMany: jest.fn(),
    generateOneSafe: jest.fn(),
} as any;

describe('BreederManagementVerificationStatusAssemblerService', () => {
    const service = new BreederManagementVerificationStatusAssemblerService();

    it('verification이 없으면 status=pending이 기본값', () => {
        const result = service.toResponse({ _id: 'b-1' } as any, fileUrlPort);
        expect(result.status).toBe('pending');
        expect(result.documents).toEqual([]);
        expect(result.submittedByEmail).toBe(false);
    });

    it('유효한 verification/ 경로의 문서만 포함한다', () => {
        const result = service.toResponse(
            {
                _id: 'b-1',
                verification: {
                    status: 'approved',
                    documents: [
                        { type: 'idCard', fileName: 'verification/id.pdf', uploadedAt: new Date() },
                        { type: 'other', fileName: 'random/x.pdf', uploadedAt: new Date() },
                        { type: 'biz', fileName: 'documents/verification/bl.pdf', uploadedAt: new Date() },
                    ],
                },
            } as any,
            fileUrlPort,
        );
        expect(result.documents).toHaveLength(2);
        expect(result.documents[0].url).toBe('https://cdn/verification/id.pdf');
    });

    it('submittedByEmail 플래그 반영', () => {
        const result = service.toResponse(
            { _id: 'b-1', verification: { submittedByEmail: true } } as any,
            fileUrlPort,
        );
        expect(result.submittedByEmail).toBe(true);
    });
});
