import { BreederVerificationAdminDetailMapperService } from '../../../domain/services/breeder-verification-admin-detail-mapper.service';

const fileUrlPort = {
    generateOne: jest.fn((f: string) => `https://cdn/${f}`),
    generateMany: jest.fn(),
    generateOneSafe: jest.fn(),
} as any;

describe('BreederVerificationAdminDetailMapperService', () => {
    const service = new BreederVerificationAdminDetailMapperService(fileUrlPort);

    it('브리더 정보를 상세 결과로 매핑한다', () => {
        const breeder: any = {
            id: 'b-1',
            emailAddress: 'b@e.com',
            nickname: '닉',
            phoneNumber: '010',
            name: '브리더',
            verification: {
                status: 'approved',
                plan: 'pro',
                level: 'elite',
                submittedAt: new Date('2026-01-01'),
                reviewedAt: new Date('2026-01-02'),
                submittedByEmail: true,
                documents: [{ type: 'id', fileName: 'id.pdf', uploadedAt: new Date() }],
            },
            profile: {
                location: { city: '서울', district: '강남구' },
                specialization: ['dog'],
                description: '설명',
                experienceYears: 5,
            },
            breeds: ['푸들'],
            createdAt: new Date('2025-12-01'),
            updatedAt: new Date('2026-01-02'),
        };
        const result = service.toResult(breeder);
        expect(result.breederId).toBe('b-1');
        expect(result.verificationInfo.verificationStatus).toBe('approved');
        expect(result.verificationInfo.documents[0].fileUrl).toBe('https://cdn/id.pdf');
        expect(result.profileInfo.location).toBe('서울');
    });

    it('verification이 없으면 기본값을 사용한다', () => {
        const breeder: any = {
            id: 'b-1',
            emailAddress: 'b@e.com',
            nickname: '닉',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = service.toResult(breeder);
        expect(result.verificationInfo.verificationStatus).toBe('pending');
        expect(result.verificationInfo.subscriptionPlan).toBe('basic');
        expect(result.verificationInfo.level).toBe('new');
    });

    it('submittedAt이 없으면 documents의 최초 uploadedAt을 사용한다', () => {
        const first = new Date('2026-01-01');
        const second = new Date('2026-01-05');
        const breeder: any = {
            id: 'b-1',
            emailAddress: 'b@e.com',
            nickname: '닉',
            verification: {
                documents: [
                    { type: 'id', fileName: 'a.pdf', uploadedAt: second },
                    { type: 'passport', fileName: 'b.pdf', uploadedAt: first },
                ],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = service.toResult(breeder);
        expect(result.verificationInfo.submittedAt).toBe(first);
    });
});
