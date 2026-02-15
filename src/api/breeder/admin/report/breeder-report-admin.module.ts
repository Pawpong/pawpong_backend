import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederReportAdminController } from './breeder-report-admin.controller';
import { BreederReportAdminService } from './breeder-report-admin.service';

import { BreederReport, BreederReportSchema } from '../../../../schema/breeder-report.schema';
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
            { name: BreederReport.name, schema: BreederReportSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
    ],
    controllers: [BreederReportAdminController],
    providers: [BreederReportAdminService],
    exports: [BreederReportAdminService],
})
export class BreederReportAdminModule {}
