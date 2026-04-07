import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederVerificationAdminCommandController } from './breeder-verification-admin-command.controller';
import { BreederVerificationAdminDetailController } from './breeder-verification-admin-detail.controller';
import { BreederVerificationAdminQueryController } from './breeder-verification-admin-query.controller';
import { GetLevelChangeRequestsUseCase } from './application/use-cases/get-level-change-requests.use-case';
import { GetPendingBreederVerificationsUseCase } from './application/use-cases/get-pending-breeder-verifications.use-case';
import { GetBreedersUseCase } from './application/use-cases/get-breeders.use-case';
import { UpdateBreederVerificationUseCase } from './application/use-cases/update-breeder-verification.use-case';
import { GetBreederDetailUseCase } from './application/use-cases/get-breeder-detail.use-case';
import { GetBreederStatsUseCase } from './application/use-cases/get-breeder-stats.use-case';
import { SendDocumentRemindersUseCase } from './application/use-cases/send-document-reminders.use-case';
import { ChangeBreederLevelUseCase } from './application/use-cases/change-breeder-level.use-case';
import { BREEDER_VERIFICATION_ADMIN_READER } from './application/ports/breeder-verification-admin-reader.port';
import { BREEDER_VERIFICATION_ADMIN_WRITER } from './application/ports/breeder-verification-admin-writer.port';
import { BREEDER_VERIFICATION_ADMIN_NOTIFIER } from './application/ports/breeder-verification-admin-notifier.port';
import { BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT } from './application/ports/breeder-verification-admin-file-url.port';
import { BreederVerificationAdminPolicyService } from './domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminActivityLogFactoryService } from './domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminPresentationService } from './domain/services/breeder-verification-admin-presentation.service';
import { BreederVerificationAdminMongooseRepositoryAdapter } from './infrastructure/breeder-verification-admin-mongoose.repository.adapter';
import { BreederVerificationAdminNotifierAdapter } from './infrastructure/breeder-verification-admin-notifier.adapter';
import { BreederVerificationAdminFileUrlAdapter } from './infrastructure/breeder-verification-admin-file-url.adapter';

import { Admin, AdminSchema } from '../../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';

import { StorageModule } from '../../../../common/storage/storage.module';
import { NotificationModule } from '../../../notification/notification.module';

/**
 * 브리더 인증 관리자 모듈
 *
 * 관리자가 브리더 인증을 관리하는 기능을 제공합니다:
 * - 브리더 인증 승인/거절
 * - 브리더 목록 조회
 * - 승인 대기 브리더 목록 조회
 *
 * Note: MailTemplateService는 NotificationModule을 통해 제공받습니다.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        NotificationModule, // MailTemplateService도 여기서 제공됨
        StorageModule, // StorageService 제공
    ],
    controllers: [
        BreederVerificationAdminQueryController,
        BreederVerificationAdminDetailController,
        BreederVerificationAdminCommandController,
    ],
    providers: [
        GetLevelChangeRequestsUseCase,
        GetPendingBreederVerificationsUseCase,
        GetBreedersUseCase,
        UpdateBreederVerificationUseCase,
        GetBreederDetailUseCase,
        GetBreederStatsUseCase,
        SendDocumentRemindersUseCase,
        ChangeBreederLevelUseCase,
        BreederVerificationAdminPolicyService,
        BreederVerificationAdminActivityLogFactoryService,
        BreederVerificationAdminPresentationService,
        BreederVerificationAdminMongooseRepositoryAdapter,
        BreederVerificationAdminNotifierAdapter,
        BreederVerificationAdminFileUrlAdapter,
        {
            provide: BREEDER_VERIFICATION_ADMIN_READER,
            useExisting: BreederVerificationAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_VERIFICATION_ADMIN_WRITER,
            useExisting: BreederVerificationAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_VERIFICATION_ADMIN_NOTIFIER,
            useExisting: BreederVerificationAdminNotifierAdapter,
        },
        {
            provide: BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT,
            useExisting: BreederVerificationAdminFileUrlAdapter,
        },
    ],
})
export class BreederVerificationAdminModule {}
