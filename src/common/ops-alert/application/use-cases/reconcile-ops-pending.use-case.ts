import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { OPS_PENDING_KIND, type OpsPendingKind } from '../../../events/ops-pending.event';
import { CustomLoggerService } from '../../../logger/custom-logger.service';
import { OpsAlertPresenterService } from '../../domain/services/ops-alert-presenter.service';
import { OpsPendingEventRepository } from '../../repository/ops-pending-event.repository';
import { OpsPendingSourceRepository } from '../../repository/ops-pending-source.repository';

/** 재동기화로 뒤늦게 채운 접수의 안내 문구 */
const CATCH_UP_SUMMARY: Record<string, string> = {
    [OPS_PENDING_KIND.ADOPTION_APPLICATION]: '상담 신청이 응답 없이 대기 중입니다. (알림 누락분 보정)',
    [OPS_PENDING_KIND.BREEDER_VERIFICATION]: '브리더 인증 서류가 심사 대기 중입니다. (알림 누락분 보정)',
    [OPS_PENDING_KIND.BREEDER_REPORT]: '처리되지 않은 브리더 신고가 있습니다. (알림 누락분 보정)',
    [OPS_PENDING_KIND.REVIEW_REPORT]: '처리되지 않은 후기 신고가 있습니다. (알림 누락분 보정)',
    [OPS_PENDING_KIND.COMMUNITY_REPORT]: '처리되지 않은 커뮤니티 신고가 있습니다. (알림 누락분 보정)',
};

/**
 * 알림 큐를 도메인 상태에 다시 맞춘다.
 *
 * 이벤트는 유실될 수 있다 — 적재가 실패하거나, 도메인 저장 직후 프로세스가 죽거나,
 * 처리 완료 이벤트가 전달되지 않을 수 있다. 그래서 원본(도메인 상태)을 정답으로 두고 양방향으로 맞춘다.
 *
 * 1. 원본은 대기인데 큐에 없다 -> 접수를 뒤늦게 만들어 알린다 (알림 유실 복구)
 * 2. 큐는 열려 있는데 원본은 처리됐다 -> 닫아서 리마인드를 멈춘다 (유령 독촉 제거)
 */
@Injectable()
export class ReconcileOpsPendingUseCase {
    /** 한 번에 되짚어볼 열린 건수 */
    private static readonly OPEN_SCAN_LIMIT = 500;

    /**
     * 종류별 스캔 커서. 대기 건이 한 번에 보는 한도보다 많을 때 다음 주기에 이어서 본다.
     * 끝까지 훑으면 비워서 처음부터 다시 돈다.
     */
    private readonly scanCursors = new Map<string, string>();

    constructor(
        private readonly eventRepository: OpsPendingEventRepository,
        private readonly sourceRepository: OpsPendingSourceRepository,
        private readonly presenter: OpsAlertPresenterService,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(now = new Date()): Promise<{ recovered: number; closed: number }> {
        const environment =
            this.configService.get<string>('APP_ENV') || this.configService.get<string>('NODE_ENV') || 'development';

        const recovered = await this.recoverMissing(environment, now);
        const closed = await this.closeAlreadyHandled(environment, now);

        if (recovered > 0 || closed > 0) {
            this.logger.logSuccess('reconcileOpsPending', '운영 알림 큐 재동기화', { recovered, closed });
        }

        return { recovered, closed };
    }

    /** 대기 중인데 큐에 없는 건을 채운다 */
    private async recoverMissing(environment: string, now: Date): Promise<number> {
        let recovered = 0;

        for (const kind of Object.values(OPS_PENDING_KIND) as OpsPendingKind[]) {
            const scan = await this.sourceRepository.listPendingReferenceIds(kind, now, this.scanCursors.get(kind));

            // 한도를 채웠으면 다음 주기에 그 뒤부터, 아니면 처음부터 다시 돈다
            if (scan.hasMore && scan.lastScannedId) {
                this.scanCursors.set(kind, scan.lastScannedId);
            } else {
                this.scanCursors.delete(kind);
            }

            if (scan.referenceIds.length === 0) continue;

            const openIds = new Set(await this.eventRepository.findOpenReferenceIds(kind, environment));

            for (const referenceId of scan.referenceIds) {
                if (openIds.has(referenceId)) continue;

                const inserted = await this.eventRepository.insert({
                    eventId: randomUUID(),
                    kind,
                    referenceId,
                    summary: CATCH_UP_SUMMARY[kind] ?? '처리 대기 건이 있습니다. (알림 누락분 보정)',
                    details: [{ name: '원본 ID', value: referenceId }],
                    adminPath: this.presenter.getAdminPath(kind),
                    environment,
                });

                if (inserted) recovered++;
            }
        }

        return recovered;
    }

    /**
     * 원본이 이미 처리된 건을 닫아 리마인드를 멈춘다.
     *
     * 한 주기에 보는 건수를 제한하되, 오래 확인되지 않은 것부터 집고 확인 시각을 남긴다.
     * 그래서 열린 건이 한도보다 많아도 모든 건이 돌아가며 검사된다.
     */
    private async closeAlreadyHandled(environment: string, now: Date): Promise<number> {
        const openEvents = await this.eventRepository.findOpenEventsToCheck(
            environment,
            ReconcileOpsPendingUseCase.OPEN_SCAN_LIMIT,
        );

        let closed = 0;
        const checkedEventIds: string[] = [];

        for (const event of openEvents) {
            checkedEventIds.push(event.eventId);

            const stillPending = await this.sourceRepository.isStillPending(event.kind, event.referenceId);
            if (stillPending) continue;

            closed += await this.eventRepository.resolve(
                environment,
                event.kind,
                event.referenceId,
                '처리 확인됨',
                now,
            );
        }

        await this.eventRepository.markChecked(checkedEventIds, now);

        return closed;
    }
}
