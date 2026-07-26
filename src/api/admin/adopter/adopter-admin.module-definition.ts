import { MongooseModule } from '@nestjs/mongoose';

import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { BreederReview, BreederReviewSchema } from '../../../schema/breeder-review.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';

import { AdopterSharedModule } from '../../service/adopter/shared/adopter-shared.module';
import { AdopterAdminReviewController } from './controller/adopter-admin-review.controller';
import { AdopterAdminApplicationController } from './controller/adopter-admin-application.controller';
import { GetAdopterAdminReviewReportsUseCase } from './application/use-cases/get-adopter-admin-review-reports.use-case';
import { DeleteAdopterAdminReviewUseCase } from './application/use-cases/delete-adopter-admin-review.use-case';
import { GetAdopterAdminApplicationListUseCase } from './application/use-cases/get-adopter-admin-application-list.use-case';
import { GetAdopterAdminApplicationDetailUseCase } from './application/use-cases/get-adopter-admin-application-detail.use-case';
import { AdopterAdminPolicyService } from './domain/services/adopter-admin-policy.service';
import { AdopterAdminActivityLogFactoryService } from './domain/services/adopter-admin-activity-log-factory.service';
import { AdopterAdminApplicationListAssemblerService } from './domain/services/adopter-admin-application-list-assembler.service';
import { AdopterAdminApplicationDetailMapperService } from './domain/services/adopter-admin-application-detail-mapper.service';
import { AdopterAdminReviewReportPageAssemblerService } from './domain/services/adopter-admin-review-report-page-assembler.service';
import { AdopterAdminReviewDeleteResultMapperService } from './domain/services/adopter-admin-review-delete-result-mapper.service';
import { AdopterAdminRepository } from './repository/adopter-admin.repository';
import { AdopterAdminReaderAdapter } from './infrastructure/adopter-admin-reader.adapter';
import { AdopterAdminWriterAdapter } from './infrastructure/adopter-admin-writer.adapter';
import { ADOPTER_ADMIN_READER_PORT } from './application/ports/adopter-admin-reader.port';
import { ADOPTER_ADMIN_WRITER_PORT } from './application/ports/adopter-admin-writer.port';

// 입양자 > 관리자 슬라이스 (후기 신고 처리, 신청 내역 조회)
// 관리자 권한 검증에 Admin 스키마가 필요하고, 신고·신청 조회를 위해 리뷰/신청 스키마도 사용한다.
const ADOPTER_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Admin.name, schema: AdminSchema },
    { name: BreederReview.name, schema: BreederReviewSchema },
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
]);

export const ADOPTER_ADMIN_MODULE_IMPORTS = [ADOPTER_ADMIN_SCHEMA_IMPORTS, AdopterSharedModule];

export const ADOPTER_ADMIN_MODULE_CONTROLLERS = [AdopterAdminReviewController, AdopterAdminApplicationController];

export const ADOPTER_ADMIN_MODULE_PROVIDERS = [
    GetAdopterAdminReviewReportsUseCase,
    DeleteAdopterAdminReviewUseCase,
    GetAdopterAdminApplicationListUseCase,
    GetAdopterAdminApplicationDetailUseCase,
    AdopterAdminPolicyService,
    AdopterAdminActivityLogFactoryService,
    AdopterAdminApplicationListAssemblerService,
    AdopterAdminApplicationDetailMapperService,
    AdopterAdminReviewReportPageAssemblerService,
    AdopterAdminReviewDeleteResultMapperService,
    AdopterAdminRepository,
    AdopterAdminReaderAdapter,
    AdopterAdminWriterAdapter,
    {
        provide: ADOPTER_ADMIN_READER_PORT,
        useExisting: AdopterAdminReaderAdapter,
    },
    {
        provide: ADOPTER_ADMIN_WRITER_PORT,
        useExisting: AdopterAdminWriterAdapter,
    },
];
