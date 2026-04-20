import { UserAdminDeletedUserPageAssemblerService } from '../../../domain/services/user-admin-deleted-user-page-assembler.service';
import { UserAdminPaginationAssemblerService } from '../../../domain/services/user-admin-pagination-assembler.service';

describe('사용자 관리자 탈퇴 사용자 페이지 조립기', () => {
    it('탈퇴 사용자 목록 페이지 응답 계약을 유지한다', () => {
        const service = new UserAdminDeletedUserPageAssemblerService(new UserAdminPaginationAssemblerService());

        expect(
            service.build(
                {
                    items: [
                        {
                            id: 'user-1',
                            emailAddress: 'deleted@test.com',
                            nickname: '탈퇴 사용자',
                            userRole: 'adopter',
                            accountStatus: 'deleted',
                            deleteReason: 'already_adopted',
                            deleteReasonDetail: '직접 입양 완료',
                            deletedAt: new Date('2026-04-09T00:00:00.000Z'),
                            createdAt: new Date('2026-04-01T00:00:00.000Z'),
                            phoneNumber: '010-1111-2222',
                        },
                    ],
                    total: 1,
                },
                1,
                20,
            ),
        ).toMatchObject({
            items: [
                {
                    userId: 'user-1',
                    email: 'deleted@test.com',
                    nickname: '탈퇴 사용자',
                    userRole: 'adopter',
                    deleteReason: 'already_adopted',
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            },
        });
    });
});
