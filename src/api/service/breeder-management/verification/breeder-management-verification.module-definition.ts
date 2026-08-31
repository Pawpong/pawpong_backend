import { StorageModule } from '../../../../common/storage/storage.module';
import { DiscordWebhookModule } from '../../../../common/discord/discord-webhook.module';

import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementProfileModule } from '../profile/breeder-management-profile.module';
import { BreederManagementVerificationQueryController } from '../controller/breeder-management-verification-query.controller';
import { BreederManagementVerificationCommandController } from '../controller/breeder-management-verification-command.controller';
import { BreederManagementVerificationDocumentsController } from '../controller/breeder-management-verification-documents.controller';
import { GetBreederManagementVerificationStatusUseCase } from '../application/use-cases/get-breeder-management-verification-status.use-case';
import { SubmitBreederManagementVerificationUseCase } from '../application/use-cases/submit-breeder-management-verification.use-case';
import { UploadBreederManagementVerificationDocumentsUseCase } from '../application/use-cases/upload-breeder-management-verification-documents.use-case';
import { SubmitBreederManagementVerificationDocumentsUseCase } from '../application/use-cases/submit-breeder-management-verification-documents.use-case';
import { RequestBreederManagementLevelChangeUseCase } from '../application/use-cases/request-breeder-management-level-change.use-case';
import { BreederManagementVerificationStatusAssemblerService } from '../domain/services/breeder-management-verification-status-assembler.service';
import { BreederManagementVerificationSubmissionMapperService } from '../domain/services/breeder-management-verification-submission-mapper.service';
import { BreederManagementVerificationOriginalFileNameService } from '../domain/services/breeder-management-verification-original-file-name.service';
import { BreederManagementVerificationDocumentPolicyService } from '../domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from '../domain/services/breeder-management-verification-notification-payload-factory.service';
import { BreederManagementVerificationCommandResultMapperService } from '../domain/services/breeder-management-verification-command-result-mapper.service';
import { BreederManagementVerificationDocumentStoreAdapter } from '../infrastructure/breeder-management-verification-document-store.adapter';
import { BreederManagementVerificationDraftStoreAdapter } from '../infrastructure/breeder-management-verification-draft-store.adapter';
import { BreederManagementVerificationNotifierAdapter } from '../infrastructure/breeder-management-verification-notifier.adapter';
import { BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT } from '../application/ports/breeder-management-verification-document-store.port';
import { BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT } from '../application/ports/breeder-management-verification-draft-store.port';
import { BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT } from '../application/ports/breeder-management-verification-notifier.port';

// 브리더 관리 > 인증(심사) 슬라이스
// 서류 저장은 StorageModule, 심사 접수 알림은 DiscordWebhookModule 을 사용한다.
// 설정(SETTINGS_PORT)·파일 URL(FILE_URL_PORT)은 shared, 브리더 조회(PROFILE_PORT)는 profile 슬라이스에서 주입.
export const BREEDER_MANAGEMENT_VERIFICATION_MODULE_IMPORTS = [
    BreederManagementSharedModule,
    BreederManagementProfileModule,
    StorageModule,
    DiscordWebhookModule,
];

export const BREEDER_MANAGEMENT_VERIFICATION_MODULE_CONTROLLERS = [
    BreederManagementVerificationQueryController,
    BreederManagementVerificationCommandController,
    BreederManagementVerificationDocumentsController,
];

const BREEDER_MANAGEMENT_VERIFICATION_USE_CASE_PROVIDERS = [
    GetBreederManagementVerificationStatusUseCase,
    SubmitBreederManagementVerificationUseCase,
    UploadBreederManagementVerificationDocumentsUseCase,
    SubmitBreederManagementVerificationDocumentsUseCase,
    RequestBreederManagementLevelChangeUseCase,
];

const BREEDER_MANAGEMENT_VERIFICATION_DOMAIN_PROVIDERS = [
    BreederManagementVerificationStatusAssemblerService,
    BreederManagementVerificationSubmissionMapperService,
    BreederManagementVerificationOriginalFileNameService,
    BreederManagementVerificationDocumentPolicyService,
    BreederManagementVerificationNotificationPayloadFactoryService,
    BreederManagementVerificationCommandResultMapperService,
];

const BREEDER_MANAGEMENT_VERIFICATION_INFRASTRUCTURE_PROVIDERS = [
    BreederManagementVerificationDocumentStoreAdapter,
    BreederManagementVerificationDraftStoreAdapter,
    BreederManagementVerificationNotifierAdapter,
];

export const BREEDER_MANAGEMENT_VERIFICATION_MODULE_PROVIDERS = [
    ...BREEDER_MANAGEMENT_VERIFICATION_USE_CASE_PROVIDERS,
    ...BREEDER_MANAGEMENT_VERIFICATION_DOMAIN_PROVIDERS,
    ...BREEDER_MANAGEMENT_VERIFICATION_INFRASTRUCTURE_PROVIDERS,
    {
        provide: BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT,
        useExisting: BreederManagementVerificationDocumentStoreAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT,
        useExisting: BreederManagementVerificationDraftStoreAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT,
        useExisting: BreederManagementVerificationNotifierAdapter,
    },
];
