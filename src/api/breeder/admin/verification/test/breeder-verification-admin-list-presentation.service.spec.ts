import { BreederVerificationAdminListPresentationService } from '../domain/services/breeder-verification-admin-list-presentation.service';

describe('브리더 인증 관리자 목록 응답 서비스', () => {
    it('레벨 변경 요청 응답 계약을 유지한다', () => {
        const service = new BreederVerificationAdminListPresentationService();

        expect(
            service.toLevelChangeRequestResponse({
                id: 'breeder-1',
                nickname: '행복브리더',
                emailAddress: 'breeder@test.com',
                phoneNumber: '01012345678',
                accountStatus: 'active',
                isTestAccount: false,
                verification: {
                    plan: 'basic',
                    level: 'new',
                    submittedByEmail: false,
                    levelChangeRequest: {
                        requestedLevel: 'elite',
                        previousLevel: 'new',
                        requestedAt: new Date('2026-04-09T00:00:00.000Z'),
                    },
                },
                profile: { location: { city: '서울', district: '강남' } },
                createdAt: new Date('2026-04-09T00:00:00.000Z'),
            } as any),
        ).toMatchObject({
            breederId: 'breeder-1',
            breederName: '행복브리더',
            verificationInfo: {
                level: 'elite',
                previousLevel: 'new',
                isLevelChange: true,
            },
        });
    });
});
