import { BreederVerificationAdminListItemMapperService } from '../../../domain/services/breeder-verification-admin-list-item-mapper.service';
import { BreederVerificationAdminPendingBreederItemMapperService } from '../../../domain/services/breeder-verification-admin-pending-breeder-item-mapper.service';

describe('브리더 인증 관리자 승인 대기 항목 매퍼', () => {
    it('승인 대기 브리더 응답 계약을 유지한다', () => {
        const service = new BreederVerificationAdminPendingBreederItemMapperService(
            new BreederVerificationAdminListItemMapperService(),
        );

        expect(
            service.toResponse({
                id: 'breeder-2',
                nickname: '대기브리더',
                emailAddress: 'pending@test.com',
                verification: {
                    status: 'pending',
                    plan: 'premium',
                    level: 'starter',
                    submittedByEmail: true,
                    submittedAt: new Date('2026-04-09T00:00:00.000Z'),
                },
                createdAt: new Date('2026-04-08T00:00:00.000Z'),
            } as any),
        ).toMatchObject({
            breederId: 'breeder-2',
            breederName: '대기브리더',
            verificationInfo: {
                verificationStatus: 'pending',
                subscriptionPlan: 'premium',
                level: 'starter',
                isSubmittedByEmail: true,
            },
        });
    });
});
