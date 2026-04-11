import { BreederVerificationAdminStatsResultMapperService } from '../domain/services/breeder-verification-admin-stats-result-mapper.service';

describe('브리더 인증 관리자 통계 결과 매퍼', () => {
    it('승인 브리더 통계 응답을 만든다', () => {
        const service = new BreederVerificationAdminStatsResultMapperService();

        expect(
            service.toResult({
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
