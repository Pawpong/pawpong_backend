import { BreederVerificationAdminBreederListPresentationService } from '../domain/services/breeder-verification-admin-breeder-list-presentation.service';
import { BreederVerificationAdminListItemPresentationService } from '../domain/services/breeder-verification-admin-list-item-presentation.service';

describe('브리더 인증 관리자 전체 목록 응답 서비스', () => {
    it('일반 브리더 목록 응답 계약을 유지한다', () => {
        const service = new BreederVerificationAdminBreederListPresentationService(
            new BreederVerificationAdminListItemPresentationService(),
        );

        expect(
            service.toResponse({
                id: 'breeder-3',
                nickname: '전체브리더',
                emailAddress: 'all@test.com',
                accountStatus: 'suspended',
                isTestAccount: true,
                verification: {
                    status: 'approved',
                    plan: 'basic',
                    level: 'verified',
                },
                createdAt: new Date('2026-04-07T00:00:00.000Z'),
            } as any),
        ).toMatchObject({
            breederId: 'breeder-3',
            breederName: '전체브리더',
            accountStatus: 'suspended',
            isTestAccount: true,
            verificationInfo: {
                verificationStatus: 'approved',
                subscriptionPlan: 'basic',
                level: 'verified',
            },
        });
    });
});
