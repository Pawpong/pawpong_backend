import { Injectable } from '@nestjs/common';

import { OPS_PENDING_KIND, type OpsPendingKind } from '../../../events/ops-pending.event';
import type { OpsPendingEventSnapshot } from '../../application/types/ops-alert.type';

/** 종류별 표시 정보 — 제목, 색, 어드민 화면 경로 */
interface OpsAlertKindPresentation {
    title: string;
    color: number;
    adminPath: string;
}

/**
 * 운영 알림 표시 규칙.
 *
 * 디스코드 embed 문구와 어드민 딥링크를 한곳에서 만든다.
 * 운영자가 알림에서 바로 처리 화면으로 넘어갈 수 있어야 "놓치지 않는" 알림이 된다.
 */
@Injectable()
export class OpsAlertPresenterService {
    private static readonly PRESENTATION: Record<OpsPendingKind, OpsAlertKindPresentation> = {
        [OPS_PENDING_KIND.ADOPTION_APPLICATION]: {
            title: '🐾 입양·상담 신청 접수',
            color: 0x4caf50,
            adminPath: '/breeders/applications',
        },
        [OPS_PENDING_KIND.BREEDER_VERIFICATION]: {
            title: '📋 브리더 인증 심사 대기',
            color: 0x3f51b5,
            adminPath: '/breeders/verification',
        },
        [OPS_PENDING_KIND.BREEDER_REPORT]: {
            title: '🚩 브리더 신고 접수',
            color: 0xf44336,
            adminPath: '/reports/breeders',
        },
        [OPS_PENDING_KIND.REVIEW_REPORT]: {
            title: '🚩 후기 신고 접수',
            color: 0xf44336,
            adminPath: '/reports/reviews',
        },
        [OPS_PENDING_KIND.COMMUNITY_REPORT]: {
            title: '🚩 커뮤니티 신고 접수',
            color: 0xf44336,
            adminPath: '/reports/community',
        },
        [OPS_PENDING_KIND.INQUIRY]: {
            title: '📨 문의 접수',
            color: 0xad651d,
            adminPath: '/support',
        },
    };

    /** 종류별 어드민 화면 경로 */
    getAdminPath(kind: OpsPendingKind): string {
        return OpsAlertPresenterService.PRESENTATION[kind]?.adminPath ?? '/';
    }

    /**
     * 디스코드 embed payload 생성.
     * 리마인드는 같은 내용에 몇 번째 독촉인지와 방치 시간만 덧붙인다.
     */
    buildPayload(params: {
        event: OpsPendingEventSnapshot;
        adminUrl: string;
        reminder?: { count: number; maxCount: number; elapsed: string };
    }): Record<string, unknown> {
        const { event, adminUrl, reminder } = params;
        const presentation =
            OpsAlertPresenterService.PRESENTATION[event.kind as OpsPendingKind] ??
            ({ title: '운영 확인 필요', color: 0x9e9e9e, adminPath: '/' } satisfies OpsAlertKindPresentation);

        const title = reminder
            ? `⏰ [미처리 ${reminder.count}/${reminder.maxCount}] ${presentation.title}`
            : presentation.title;

        const fields = [
            { name: '접수번호', value: event.eventId, inline: false },
            ...event.details.map((detail) => ({
                name: this.sanitize(detail.name, 64),
                value: this.sanitize(detail.value, 512) || '-',
                inline: true,
            })),
            { name: '환경', value: event.environment, inline: true },
            { name: '접수 시각', value: event.createdAt.toISOString(), inline: true },
            ...(reminder ? [{ name: '방치 시간', value: reminder.elapsed, inline: true }] : []),
        ];

        return {
            allowed_mentions: { parse: [] },
            embeds: [
                {
                    title,
                    // 리마인드는 눈에 띄어야 해서 색을 따로 준다 (주황)
                    color: reminder ? 0xff9800 : presentation.color,
                    description: this.sanitize(event.summary, 1500) || '요약 없음',
                    fields,
                    url: `${adminUrl.replace(/\/+$/, '')}${event.adminPath}`,
                    footer: {
                        text: reminder ? 'Pawpong · 처리하면 리마인드가 멈춤' : 'Pawpong · 제목을 눌러 어드민에서 처리',
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        };
    }

    /**
     * 알림 본문 정리.
     * 개인정보는 발행 도메인에서 걸러 보내지만, 방에 그대로 남는 값이라 여기서 한 번 더 막는다.
     */
    private sanitize(value: string, maxLength: number): string {
        const masked = (value || '')
            .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[이메일 숨김]')
            .replace(/(?:\+?82[- .]?)?0?1[016789][- .]?\d{3,4}[- .]?\d{4}/g, '[전화번호 숨김]')
            .replace(/(?:bearer\s+|sk-)[a-z0-9_.-]+/gi, '[인증정보 숨김]')
            .replace(/@(everyone|here)/g, '@ $1')
            .trim();

        return masked.length > maxLength ? `${masked.slice(0, maxLength - 3)}...` : masked;
    }
}
