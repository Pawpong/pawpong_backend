import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederReportAdminController } from './breeder-report-admin.controller';
import { BreederReportAdminService } from './breeder-report-admin.service';
import { GetBreederReportsUseCase } from './application/use-cases/get-breeder-reports.use-case';
import { HandleBreederReportUseCase } from './application/use-cases/handle-breeder-report.use-case';
import { BREEDER_REPORT_ADMIN_READER } from './application/ports/breeder-report-admin-reader.port';
import { BREEDER_REPORT_ADMIN_WRITER } from './application/ports/breeder-report-admin-writer.port';
import { BreederReportAdminPolicyService } from './domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminActivityLogFactoryService } from './domain/services/breeder-report-admin-activity-log-factory.service';
import { BreederReportAdminPresentationService } from './domain/services/breeder-report-admin-presentation.service';
import { BreederReportAdminMongooseRepositoryAdapter } from './infrastructure/breeder-report-admin-mongoose.repository.adapter';

import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../../../schema/admin.schema';

/**
 * 브리더 신고 관리 Admin 모듈
 *
 * 관리자가 브리더 신고를 관리하는 기능을 제공합니다:
 * - 브리더 신고 목록 조회
 * - 브리더 신고 처리 (승인/반려)
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
    ],
    controllers: [BreederReportAdminController],
    providers: [
        BreederReportAdminService,
        GetBreederReportsUseCase,
        HandleBreederReportUseCase,
        BreederReportAdminPolicyService,
        BreederReportAdminActivityLogFactoryService,
        BreederReportAdminPresentationService,
        BreederReportAdminMongooseRepositoryAdapter,
        {
            provide: BREEDER_REPORT_ADMIN_READER,
            useExisting: BreederReportAdminMongooseRepositoryAdapter,
        },
        {
            provide: BREEDER_REPORT_ADMIN_WRITER,
            useExisting: BreederReportAdminMongooseRepositoryAdapter,
        },
    ],
    exports: [BreederReportAdminService],
})
export class BreederReportAdminModule {}
