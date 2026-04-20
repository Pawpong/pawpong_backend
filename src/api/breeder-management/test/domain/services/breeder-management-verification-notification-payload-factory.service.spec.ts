import { BreederManagementVerificationNotificationPayloadFactoryService } from '../../../domain/services/breeder-management-verification-notification-payload-factory.service';

const fileUrlPort = {
    generateOne: jest.fn((name: string) => `https://cdn/${name}`),
    generateMany: jest.fn(),
    generateOneSafe: jest.fn(),
} as any;

describe('BreederManagementVerificationNotificationPayloadFactoryService', () => {
    const service = new BreederManagementVerificationNotificationPayloadFactoryService();

    it('breeder name이 없으면 이름 미설정 사용', () => {
        const payload = service.create({
            breeder: { _id: 'b-1', emailAddress: 'b@e.com' } as any,
            level: 'new',
            isResubmission: false,
            submittedAt: new Date(),
            finalDocuments: [{ type: 'idCard', fileName: 'verification/id.pdf', uploadedAt: new Date() } as any],
            draftDocuments: [],
            fileUrlPort,
        });
        expect(payload.breederName).toBe('이름 미설정');
        expect(payload.documents[0].url).toBe('https://cdn/verification/id.pdf');
    });

    it('originalFileName: draft > document > fileName 마지막 세그먼트 순서', () => {
        const payload = service.create({
            breeder: { _id: 'b-1', name: '브리더', emailAddress: 'b@e.com' } as any,
            level: 'elite',
            isResubmission: true,
            submittedAt: new Date(),
            finalDocuments: [
                { type: 'idCard', fileName: 'verification/abc.pdf', uploadedAt: new Date() } as any,
            ],
            draftDocuments: [
                { fileName: 'verification/abc.pdf', originalFileName: '신분증.pdf' } as any,
            ],
            fileUrlPort,
        });
        expect(payload.documents[0].originalFileName).toBe('신분증.pdf');
    });

    it('draft 매칭이 없고 document.originalFileName도 없으면 마지막 세그먼트', () => {
        const payload = service.create({
            breeder: { _id: 'b-1', name: '브리더', emailAddress: 'b@e.com' } as any,
            level: 'new',
            isResubmission: false,
            submittedAt: new Date(),
            finalDocuments: [{ type: 'idCard', fileName: 'verification/folder/abc.pdf', uploadedAt: new Date() } as any],
            draftDocuments: [],
            fileUrlPort,
        });
        expect(payload.documents[0].originalFileName).toBe('abc.pdf');
    });
});
