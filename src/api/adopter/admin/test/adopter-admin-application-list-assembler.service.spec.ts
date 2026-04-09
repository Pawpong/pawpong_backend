import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { AdopterAdminApplicationListAssemblerService } from '../domain/services/adopter-admin-application-list-assembler.service';

describe('입양자 관리자 신청 목록 조립 서비스', () => {
    it('입양 신청 목록 응답 계약을 유지한다', () => {
        const service = new AdopterAdminApplicationListAssemblerService();

        expect(
            service.toResponse({
                items: [
                    {
                        applicationId: 'application-1',
                        adopterName: '홍길동',
                        adopterEmail: 'adopter@test.com',
                        adopterPhone: '010-0000-0000',
                        breederId: 'breeder-1',
                        breederName: '브리더',
                        petName: '포포',
                        status: ApplicationStatus.CONSULTATION_PENDING,
                        appliedAt: new Date('2026-04-06T00:00:00.000Z'),
                        processedAt: undefined,
                    },
                ],
                totalCount: 1,
                pendingCount: 1,
                completedCount: 0,
                approvedCount: 0,
                rejectedCount: 0,
                page: 1,
                limit: 10,
            }),
        ).toMatchObject({
            applications: [
                {
                    applicationId: 'application-1',
                    breederName: '브리더',
                },
            ],
            totalCount: 1,
            pendingCount: 1,
            currentPage: 1,
            pageSize: 10,
            totalPages: 1,
        });
    });
});
