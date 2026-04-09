import { UserAdminDeletedUserPresentationService } from '../domain/services/user-admin-deleted-user-presentation.service';
import { UserAdminPaginationAssemblerService } from '../domain/services/user-admin-pagination-assembler.service';

describe('사용자 관리자 탈퇴 사용자 응답 서비스', () => {
    it('탈퇴 사용자 통계 응답 계약을 유지한다', () => {
        const service = new UserAdminDeletedUserPresentationService(new UserAdminPaginationAssemblerService());

        expect(
            service.toDeletedUserStatsResponse({
                totalDeletedAdopters: 1,
                totalDeletedBreeders: 1,
                adopterReasonStats: [{ reason: 'already_adopted', count: 1 }],
                breederReasonStats: [{ reason: 'no_inquiry', count: 1 }],
                otherReasonDetails: [{ userType: 'breeder', reason: '직접 정리', deletedAt: '2026-04-09T00:00:00.000Z' }],
                last7DaysCount: 2,
                last30DaysCount: 2,
            }),
        ).toMatchObject({
            totalDeletedUsers: 2,
            adopterReasonStats: [{ reasonLabel: '이미 입양을 마쳤어요', percentage: 100 }],
            breederReasonStats: [{ reasonLabel: '입양 문의가 잘 오지 않았어요', percentage: 100 }],
            last7DaysCount: 2,
            last30DaysCount: 2,
        });
    });
});
