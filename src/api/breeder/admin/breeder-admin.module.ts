import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MailModule } from '../../../common/mail/mail.module';
import { StorageModule } from '../../../common/storage/storage.module';
import { AlimtalkModule } from '../../../common/alimtalk/alimtalk.module';
import { NotificationModule } from '../../../api/notification/notification.module';
import { BreederReportAdminModule } from './report/breeder-report-admin.module';
import { BreederVerificationAdminModule } from './verification/breeder-verification-admin.module';

import { BreederAdminController } from './breeder-admin.controller';
import { SuspendBreederUseCase } from './application/use-cases/suspend-breeder.use-case';
import { UnsuspendBreederUseCase } from './application/use-cases/unsuspend-breeder.use-case';
import { SendBreederRemindNotificationsUseCase } from './application/use-cases/send-breeder-remind-notifications.use-case';
import { SetBreederTestAccountUseCase } from './application/use-cases/set-breeder-test-account.use-case';
import { BREEDER_ADMIN_READER } from './application/ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER } from './application/ports/breeder-admin-writer.port';
import { BREEDER_ADMIN_NOTIFIER } from './application/ports/breeder-admin-notifier.port';
import { BreederAdminPolicyService } from './domain/services/breeder-admin-policy.service';
import { BreederAdminActivityLogFactoryService } from './domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPresentationService } from './domain/services/breeder-admin-presentation.service';
import { BreederAdminReminderPolicyService } from './domain/services/breeder-admin-reminder-policy.service';
import { BreederAdminMongooseRepositoryAdapter } from './infrastructure/breeder-admin-mongoose.repository.adapter';
import { BreederAdminNotifierAdapter } from './infrastructure/breeder-admin-notifier.adapter';

import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../../schema/admin.schema';

/**
 * 브리더 관리자 모듈 (통합)
 *
 * 관리자가 브리더를 관리하는 모든 기능을 통합 제공합니다:
 * - 브리더 계정 관리 (정지/해제) - BreederAdminController
 * - 브리더 인증 관리 - BreederVerificationAdminModule
 * - 브리더 신고 관리 - BreederReportAdminModule
 *
 * 구조:
 * - /api/breeder-admin/* - 계정 관리 (기본)
 * - /api/breeder-admin/verification/* - 인증 관리 (서브모듈)
 * - /api/breeder-admin/report/* - 신고 관리 (서브모듈)
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        StorageModule,
        MailModule,
        NotificationModule,
        AlimtalkModule,
        // Sub-modules
        BreederReportAdminModule,
        BreederVerificationAdminModule,
    ],
    controllers: [BreederAdminController],
    providers: [
        SuspendBreederUseCase,
        UnsuspendBreederUseCase,
        SendBreederRemindNotificationsUseCase,
        SetBreederTestAccountUseCase,
        BreederAdminPolicyService,
        BreederAdminActivityLogFactoryService,
        BreederAdminPresentationService,
        BreederAdminReminderPolicyService,
        BreederAdminMongooseRepositoryAdapter,
        BreederAdminNotifierAdapter,
        {
            provide: BREEDER_ADMIN_READER,
            useExisting: BreederAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_ADMIN_WRITER,
            useExisting: BreederAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_ADMIN_NOTIFIER,
            useExisting: BreederAdminNotifierAdapter,
        },
    ],
    exports: [BreederReportAdminModule, BreederVerificationAdminModule],
})
export class BreederAdminModule {}
