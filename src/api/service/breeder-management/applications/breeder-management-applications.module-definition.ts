import { MailModule } from '../../../../common/mail/mail.module';

import { NotificationModule } from '../../notification/notification.module';
import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementProfileModule } from '../profile/breeder-management-profile.module';
import { BreederManagementApplicationsQueryController } from '../controller/breeder-management-applications-query.controller';
import { BreederManagementApplicationStatusController } from '../controller/breeder-management-application-status.controller';
import { BreederManagementApplicationFormQueryController } from '../controller/breeder-management-application-form-query.controller';
import { BreederManagementApplicationFormCommandController } from '../controller/breeder-management-application-form-command.controller';
import { GetBreederManagementReceivedApplicationsUseCase } from '../application/use-cases/get-breeder-management-received-applications.use-case';
import { GetBreederManagementApplicationDetailUseCase } from '../application/use-cases/get-breeder-management-application-detail.use-case';
import { UpdateBreederManagementApplicationStatusUseCase } from '../application/use-cases/update-breeder-management-application-status.use-case';
import { GetBreederManagementApplicationFormUseCase } from '../application/use-cases/get-breeder-management-application-form.use-case';
import { UpdateBreederManagementApplicationFormUseCase } from '../application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from '../application/use-cases/update-breeder-management-simple-application-form.use-case';
import { BreederManagementReceivedApplicationMapperService } from '../domain/services/breeder-management-received-application-mapper.service';
import { BreederManagementApplicationDetailAssemblerService } from '../domain/services/breeder-management-application-detail-assembler.service';
import { BreederManagementApplicationCommandResultMapperService } from '../domain/services/breeder-management-application-command-result-mapper.service';
import { BreederManagementApplicationStatusResultMapperService } from '../domain/services/breeder-management-application-status-result-mapper.service';
import { BreederManagementApplicationFormAssemblerService } from '../domain/services/breeder-management-application-form-assembler.service';
import { BreederManagementApplicationFormValidatorService } from '../domain/services/breeder-management-application-form-validator.service';
import { BreederManagementSimpleApplicationFormBuilderService } from '../domain/services/breeder-management-simple-application-form-builder.service';
import { BreederManagementStandardQuestionCatalogService } from '../domain/services/breeder-management-standard-question-catalog.service';
import { BreederManagementApplicationWorkflowAdapter } from '../infrastructure/breeder-management-application-workflow.adapter';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from '../application/ports/breeder-management-application-workflow.port';

// 브리더 관리 > 입양 신청 슬라이스
// 신청 워크플로우(상태 변경)는 메일·알림 발송을 동반하므로 MailModule/NotificationModule 이 필요하다.
// 목록 조회(LIST_READER_PORT)·설정(SETTINGS_PORT)은 shared, 소유권 검증(PROFILE_PORT)은 profile 슬라이스에서 주입.
export const BREEDER_MANAGEMENT_APPLICATIONS_MODULE_IMPORTS = [
    BreederManagementSharedModule,
    BreederManagementProfileModule,
    MailModule,
    NotificationModule,
];

export const BREEDER_MANAGEMENT_APPLICATIONS_MODULE_CONTROLLERS = [
    BreederManagementApplicationsQueryController,
    BreederManagementApplicationStatusController,
    BreederManagementApplicationFormQueryController,
    BreederManagementApplicationFormCommandController,
];

const BREEDER_MANAGEMENT_APPLICATIONS_USE_CASE_PROVIDERS = [
    GetBreederManagementReceivedApplicationsUseCase,
    GetBreederManagementApplicationDetailUseCase,
    UpdateBreederManagementApplicationStatusUseCase,
    GetBreederManagementApplicationFormUseCase,
    UpdateBreederManagementApplicationFormUseCase,
    UpdateBreederManagementSimpleApplicationFormUseCase,
];

const BREEDER_MANAGEMENT_APPLICATIONS_DOMAIN_PROVIDERS = [
    BreederManagementReceivedApplicationMapperService,
    BreederManagementApplicationDetailAssemblerService,
    BreederManagementApplicationCommandResultMapperService,
    BreederManagementApplicationStatusResultMapperService,
    BreederManagementApplicationFormAssemblerService,
    BreederManagementApplicationFormValidatorService,
    BreederManagementSimpleApplicationFormBuilderService,
    BreederManagementStandardQuestionCatalogService,
];

export const BREEDER_MANAGEMENT_APPLICATIONS_MODULE_PROVIDERS = [
    ...BREEDER_MANAGEMENT_APPLICATIONS_USE_CASE_PROVIDERS,
    ...BREEDER_MANAGEMENT_APPLICATIONS_DOMAIN_PROVIDERS,
    BreederManagementApplicationWorkflowAdapter,
    {
        provide: BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT,
        useExisting: BreederManagementApplicationWorkflowAdapter,
    },
];
