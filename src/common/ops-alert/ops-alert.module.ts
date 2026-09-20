import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdoptionApplication, AdoptionApplicationSchema } from '../../schema/adoption-application.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';
import { CommunityPostReport, CommunityPostReportSchema } from '../../schema/community-post-report.schema';
import { OpsPendingEventRecord, OpsPendingEventSchema } from '../../schema/ops-pending-event.schema';
import { LoggerModule } from '../logger/logger.module';
import { OPS_ALERT_WEBHOOK_PORT } from './application/ports/ops-alert-webhook.port';
import { RecordOpsPendingUseCase } from './application/use-cases/record-ops-pending.use-case';
import { ReconcileOpsPendingUseCase } from './application/use-cases/reconcile-ops-pending.use-case';
import { ResolveOpsPendingUseCase } from './application/use-cases/resolve-ops-pending.use-case';
import { OpsAlertPresenterService } from './domain/services/ops-alert-presenter.service';
import { OpsAlertReminderPolicyService } from './domain/services/ops-alert-reminder-policy.service';
import { OpsAlertDiscordWebhookAdapter } from './infrastructure/ops-alert-discord-webhook.adapter';
import { OpsAlertDiscordWorker } from './infrastructure/ops-alert-discord.worker';
import { OpsPendingEventListener } from './infrastructure/ops-pending-event.listener';
import { OpsPendingStoreMigrator } from './infrastructure/ops-pending-store.migrator';
import { OpsPendingEventRepository } from './repository/ops-pending-event.repository';
import { OpsPendingSourceRepository } from './repository/ops-pending-source.repository';

/**
 * 운영자 처리 대기 알림.
 *
 * 도메인이 발행한 ops.pending.* 이벤트를 받아 종류별 디스코드 방으로 알리고,
 * 처리될 때까지 정해진 주기로 리마인드한다.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: OpsPendingEventRecord.name, schema: OpsPendingEventSchema },
            // 재동기화는 도메인 상태를 원본으로 삼으므로 읽기 전용으로 함께 등록한다
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: BreederReview.name, schema: BreederReviewSchema },
            { name: CommunityPostReport.name, schema: CommunityPostReportSchema },
        ]),
        LoggerModule,
    ],
    providers: [
        OpsPendingEventRepository,
        OpsPendingSourceRepository,
        OpsAlertPresenterService,
        OpsAlertReminderPolicyService,
        RecordOpsPendingUseCase,
        ResolveOpsPendingUseCase,
        ReconcileOpsPendingUseCase,
        OpsPendingEventListener,
        OpsPendingStoreMigrator,
        OpsAlertDiscordWorker,
        OpsAlertDiscordWebhookAdapter,
        {
            provide: OPS_ALERT_WEBHOOK_PORT,
            useExisting: OpsAlertDiscordWebhookAdapter,
        },
    ],
})
export class OpsAlertModule {}
