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
import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from './application/ports/breeder-verification-admin-reader.port';
import { BREEDER_VERIFICATION_ADMIN_WRITER_PORT } from './application/ports/breeder-verification-admin-writer.port';
import { BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT } from './application/ports/breeder-verification-admin-notifier.port';
import { BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT } from './application/ports/breeder-verification-admin-file-url.port';
import { BreederVerificationAdminPolicyService } from './domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminActivityLogFactoryService } from './domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminCommandResponseService } from './domain/services/breeder-verification-admin-command-response.service';
import { BreederVerificationAdminListPaginationService } from './domain/services/breeder-verification-admin-list-pagination.service';
import { BreederVerificationAdminBreederItemMapperService } from './domain/services/breeder-verification-admin-breeder-item-mapper.service';
import { BreederVerificationAdminDetailMapperService } from './domain/services/breeder-verification-admin-detail-mapper.service';
import { BreederVerificationAdminLevelChangeItemMapperService } from './domain/services/breeder-verification-admin-level-change-item-mapper.service';
import { BreederVerificationAdminListItemMapperService } from './domain/services/breeder-verification-admin-list-item-mapper.service';
import { BreederVerificationAdminPendingBreederItemMapperService } from './domain/services/breeder-verification-admin-pending-breeder-item-mapper.service';
import { BreederVerificationAdminStatsResultMapperService } from './domain/services/breeder-verification-admin-stats-result-mapper.service';
import { BreederVerificationAdminMongooseRepositoryAdapter } from './infrastructure/breeder-verification-admin-mongoose.repository.adapter';
import { BreederVerificationAdminNotifierAdapter } from './infrastructure/breeder-verification-admin-notifier.adapter';
import { BreederVerificationAdminFileUrlAdapter } from './infrastructure/breeder-verification-admin-file-url.adapter';
import { BreederVerificationAdminRepository } from './repository/breeder-verification-admin.repository';
import { BreederPaginationAssemblerService } from '../../domain/services/breeder-pagination-assembler.service';

import { Admin, AdminSchema } from '../../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';

import { MailModule } from '../../../../common/mail/mail.module';
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
 * Note: NotificationDispatchPort는 NotificationModule, MailTemplateService는 MailModule을 통해 제공받습니다.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        MailModule,
        NotificationModule,
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
        BreederPaginationAssemblerService,
        BreederVerificationAdminCommandResponseService,
        BreederVerificationAdminListPaginationService,
        BreederVerificationAdminListItemMapperService,
        BreederVerificationAdminLevelChangeItemMapperService,
        BreederVerificationAdminPendingBreederItemMapperService,
        BreederVerificationAdminBreederItemMapperService,
        BreederVerificationAdminDetailMapperService,
        BreederVerificationAdminStatsResultMapperService,
        BreederVerificationAdminRepository,
        BreederVerificationAdminMongooseRepositoryAdapter,
        BreederVerificationAdminNotifierAdapter,
        BreederVerificationAdminFileUrlAdapter,
        {
            provide: BREEDER_VERIFICATION_ADMIN_READER_PORT,
            useExisting: BreederVerificationAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_VERIFICATION_ADMIN_WRITER_PORT,
            useExisting: BreederVerificationAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT,
            useExisting: BreederVerificationAdminNotifierAdapter,
        },
        {
            provide: BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT,
            useExisting: BreederVerificationAdminFileUrlAdapter,
        },
    ],
})
export class BreederVerificationAdminModule {}
