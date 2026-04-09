import { BreederVerificationAdminCommandResponseService } from '../domain/services/breeder-verification-admin-command-response.service';

describe('브리더 인증 관리자 명령 응답 서비스', () => {
    const service = new BreederVerificationAdminCommandResponseService();

    it('레벨 변경 응답을 만든다', () => {
        expect(
            service.toLevelChangeResponse(
                {
                    id: 'breeder-1',
                    nickname: '행복브리더',
                } as any,
                'new',
                'elite',
                new Date('2026-04-09T00:00:00.000Z'),
                '운영자',
            ),
        ).toEqual({
            breederId: 'breeder-1',
            breederName: '행복브리더',
            previousLevel: 'new',
            newLevel: 'elite',
            changedAt: new Date('2026-04-09T00:00:00.000Z'),
            changedBy: '운영자',
        });
    });

    it('서류 리마인드 응답을 만든다', () => {
        expect(service.toDocumentReminderResponse(2, ['breeder-1', 'breeder-2'])).toEqual({
            sentCount: 2,
            breederIds: ['breeder-1', 'breeder-2'],
        });
    });
});
