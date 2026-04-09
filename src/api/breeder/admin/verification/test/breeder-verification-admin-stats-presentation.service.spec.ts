import { BreederVerificationAdminStatsPresentationService } from '../domain/services/breeder-verification-admin-stats-presentation.service';

describe('브리더 인증 관리자 통계 응답 서비스', () => {
    it('승인 브리더 통계 응답을 만든다', () => {
        const service = new BreederVerificationAdminStatsPresentationService();

        expect(
            service.toBreederStatsResponse({
                totalApproved: 10,
                eliteCount: 4,
            }),
        ).toEqual({
            totalApproved: 10,
            eliteCount: 4,
            newCount: 6,
        });
    });
});
