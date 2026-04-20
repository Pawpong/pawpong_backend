import { BreederVerificationAdminListItemMapperService } from '../../../domain/services/breeder-verification-admin-list-item-mapper.service';

describe('BreederVerificationAdminListItemMapperService', () => {
    const service = new BreederVerificationAdminListItemMapperService();

    const verificationInfo: any = {
        verificationStatus: 'pending',
        subscriptionPlan: 'basic',
        level: 'new',
        submittedAt: undefined,
        isSubmittedByEmail: false,
    };

    it('브리더 + verificationInfo로 리스트 아이템을 구성한다', () => {
        const breeder: any = {
            id: 'b-1',
            nickname: '닉',
            emailAddress: 'b@e.com',
            phoneNumber: '010',
            accountStatus: 'active',
            isTestAccount: false,
            profile: { location: { city: '서울' } },
            createdAt: new Date(),
        };
        const result = service.toResult(breeder, verificationInfo);
        expect(result.breederId).toBe('b-1');
        expect(result.accountStatus).toBe('active');
        expect(result.isTestAccount).toBe(false);
    });

    it('accountStatus가 없으면 active를 기본값으로', () => {
        const breeder: any = { id: 'b-1', nickname: '닉', emailAddress: 'b@e.com', createdAt: new Date() };
        const result = service.toResult(breeder, verificationInfo);
        expect(result.accountStatus).toBe('active');
        expect(result.isTestAccount).toBe(false);
    });

    describe('resolveSubmittedAt', () => {
        it('verification이 없으면 undefined', () => {
            expect(service.resolveSubmittedAt(undefined)).toBeUndefined();
        });
        it('submittedAt이 있으면 반환', () => {
            const at = new Date();
            expect(service.resolveSubmittedAt({ submittedAt: at } as any)).toBe(at);
        });
        it('없고 documents uploadedAt 중 최소', () => {
            const early = new Date('2026-01-01');
            const late = new Date('2026-05-01');
            const result = service.resolveSubmittedAt({
                documents: [{ uploadedAt: late }, { uploadedAt: early }],
            } as any);
            expect(result).toBe(early);
        });
    });
});
