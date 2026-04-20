import { MongooseModule } from '@nestjs/mongoose';

import { Admin, AdminSchema } from '../../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';
import { BreederPaginationAssemblerService } from '../../domain/services/breeder-pagination-assembler.service';

import { BREEDER_REPORT_ADMIN_READER_PORT } from './application/ports/breeder-report-admin-reader.port';
import { BREEDER_REPORT_ADMIN_WRITER_PORT } from './application/ports/breeder-report-admin-writer.port';
import { GetBreederReportsUseCase } from './application/use-cases/get-breeder-reports.use-case';
import { HandleBreederReportUseCase } from './application/use-cases/handle-breeder-report.use-case';
import { BreederReportAdminCommandController } from './breeder-report-admin-command.controller';
import { BreederReportAdminQueryController } from './breeder-report-admin-query.controller';
import { BreederReportAdminActionResultMapperService } from './domain/services/breeder-report-admin-action-result-mapper.service';
import { BreederReportAdminActivityLogFactoryService } from './domain/services/breeder-report-admin-activity-log-factory.service';
import { BreederReportAdminPageAssemblerService } from './domain/services/breeder-report-admin-page-assembler.service';
import { BreederReportAdminPolicyService } from './domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminMongooseRepositoryAdapter } from './infrastructure/breeder-report-admin-mongoose.repository.adapter';
import { BreederReportAdminRepository } from './repository/breeder-report-admin.repository';

const BREEDER_REPORT_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Admin.name, schema: AdminSchema },
]);

export const BREEDER_REPORT_ADMIN_MODULE_IMPORTS = [BREEDER_REPORT_ADMIN_SCHEMA_IMPORTS];

export const BREEDER_REPORT_ADMIN_MODULE_CONTROLLERS = [
    BreederReportAdminQueryController,
    BreederReportAdminCommandController,
];

const BREEDER_REPORT_ADMIN_USE_CASE_PROVIDERS = [GetBreederReportsUseCase, HandleBreederReportUseCase];

const BREEDER_REPORT_ADMIN_DOMAIN_PROVIDERS = [
    BreederReportAdminPolicyService,
    BreederReportAdminActivityLogFactoryService,
    BreederPaginationAssemblerService,
    BreederReportAdminPageAssemblerService,
    BreederReportAdminActionResultMapperService,
];

const BREEDER_REPORT_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    BreederReportAdminRepository,
    BreederReportAdminMongooseRepositoryAdapter,
];

const BREEDER_REPORT_ADMIN_PORT_BINDINGS = [
    {
        provide: BREEDER_REPORT_ADMIN_READER_PORT,
        useExisting: BreederReportAdminMongooseRepositoryAdapter,
    },
    {
        provide: BREEDER_REPORT_ADMIN_WRITER_PORT,
        useExisting: BreederReportAdminMongooseRepositoryAdapter,
    },
];

export const BREEDER_REPORT_ADMIN_MODULE_PROVIDERS = [
    ...BREEDER_REPORT_ADMIN_USE_CASE_PROVIDERS,
    ...BREEDER_REPORT_ADMIN_DOMAIN_PROVIDERS,
    ...BREEDER_REPORT_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_REPORT_ADMIN_PORT_BINDINGS,
];
