import { BreederVerificationAdminCommandResultMapperService } from '../domain/services/breeder-verification-admin-command-result-mapper.service';

describe('브리더 인증 관리자 명령 결과 매퍼', () => {
    const service = new BreederVerificationAdminCommandResultMapperService();

    it('레벨 변경 결과를 만든다', () => {
        expect(
            service.toLevelChangeResult(
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

    it('서류 리마인드 결과를 만든다', () => {
        expect(service.toDocumentReminderResult(2, ['breeder-1', 'breeder-2'])).toEqual({
            sentCount: 2,
            breederIds: ['breeder-1', 'breeder-2'],
        });
    });
});
