import { UserAdminPhoneWhitelistPresentationService } from '../domain/services/user-admin-phone-whitelist-presentation.service';

describe('사용자 관리자 화이트리스트 응답 서비스', () => {
    it('전화번호 화이트리스트 목록 응답 계약을 유지한다', () => {
        const service = new UserAdminPhoneWhitelistPresentationService();

        expect(
            service.toPhoneWhitelistListResponse([
                {
                    id: 'wl-1',
                    phoneNumber: '01012345678',
                    description: '테스트',
                    isActive: true,
                    createdBy: 'admin-1',
                    createdAt: new Date('2026-04-09T00:00:00.000Z'),
                    updatedAt: new Date('2026-04-09T00:00:00.000Z'),
                },
            ]),
        ).toMatchObject({
            total: 1,
            items: [{ id: 'wl-1', phoneNumber: '01012345678', description: '테스트' }],
        });
    });
});
