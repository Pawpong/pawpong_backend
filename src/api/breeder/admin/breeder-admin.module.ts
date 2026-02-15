import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MailModule } from '../../../common/mail/mail.module';
import { StorageModule } from '../../../common/storage/storage.module';
import { AlimtalkModule } from '../../../common/alimtalk/alimtalk.module';
import { NotificationModule } from '../../../api/notification/notification.module';
import { BreederReportAdminModule } from './report/breeder-report-admin.module';
import { BreederVerificationAdminModule } from './verification/breeder-verification-admin.module';

import { BreederAdminController } from './breeder-admin.controller';
import { BreederAdminService } from './breeder-admin.service';

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
    providers: [BreederAdminService],
    exports: [BreederAdminService, BreederReportAdminModule, BreederVerificationAdminModule],
})
export class BreederAdminModule {}
