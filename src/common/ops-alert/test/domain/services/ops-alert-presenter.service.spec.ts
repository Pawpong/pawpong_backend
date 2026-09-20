import { OPS_PENDING_KIND } from '../../../../events/ops-pending.event';
import { OpsAlertPresenterService } from '../../../domain/services/ops-alert-presenter.service';
import type { OpsPendingEventSnapshot } from '../../../application/types/ops-alert.type';

describe('OpsAlertPresenterService', () => {
    const presenter = new OpsAlertPresenterService();

    const snapshot: OpsPendingEventSnapshot = {
        eventId: 'evt-1',
        kind: OPS_PENDING_KIND.ADOPTION_APPLICATION,
        referenceId: 'app-1',
        summary: '입양자가 상담을 신청했습니다.',
        details: [{ name: '신청 ID', value: 'app-1' }],
        adminPath: '/breeders/applications',
        environment: 'production',
        remindCount: 0,
        createdAt: new Date('2026-09-20T00:00:00.000Z'),
    };

    const firstEmbed = (payload: Record<string, unknown>) => (payload.embeds as Array<Record<string, any>>)[0];

    it('종류별 어드민 화면 경로를 돌려준다', () => {
        expect(presenter.getAdminPath(OPS_PENDING_KIND.BREEDER_VERIFICATION)).toBe('/breeders/verification');
        expect(presenter.getAdminPath(OPS_PENDING_KIND.COMMUNITY_REPORT)).toBe('/reports/community');
    });

    it('어드민 딥링크를 embed url 로 붙인다', () => {
        const embed = firstEmbed(presenter.buildPayload({ event: snapshot, adminUrl: 'https://admin.pawpong.kr/' }));

        // 운영자가 알림에서 바로 처리 화면으로 넘어갈 수 있어야 한다
        expect(embed.url).toBe('https://admin.pawpong.kr/breeders/applications');
        expect(embed.title).toBe('🐾 입양·상담 신청 접수');
    });

    it('리마인드는 몇 번째 독촉인지와 방치 시간을 함께 보여준다', () => {
        const embed = firstEmbed(
            presenter.buildPayload({
                event: snapshot,
                adminUrl: 'https://admin.pawpong.kr',
                reminder: { count: 2, maxCount: 4, elapsed: '12시간' },
            }),
        );

        expect(embed.title).toBe('⏰ [미처리 2/4] 🐾 입양·상담 신청 접수');
        expect(embed.fields).toContainEqual({ name: '방치 시간', value: '12시간', inline: true });
    });

    it('연락처와 멘션은 방에 그대로 남기지 않는다', () => {
        const embed = firstEmbed(
            presenter.buildPayload({
                event: {
                    ...snapshot,
                    summary: '신청자 연락처 010-1234-5678 / test@pawpong.kr @everyone',
                },
                adminUrl: 'https://admin.pawpong.kr',
            }),
        );

        expect(embed.description).not.toContain('010-1234-5678');
        expect(embed.description).not.toContain('test@pawpong.kr');
        expect(embed.description).not.toContain('@everyone');
    });
});
