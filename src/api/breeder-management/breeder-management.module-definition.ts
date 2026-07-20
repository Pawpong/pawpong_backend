import { MongooseModule } from '@nestjs/mongoose';

import { BreederManagementAccountController } from './controller/breeder-management-account.controller';
import { BreederManagementApplicationFormCommandController } from './controller/breeder-management-application-form-command.controller';
import { BreederManagementApplicationFormQueryController } from './controller/breeder-management-application-form-query.controller';
import { BreederManagementApplicationStatusController } from './controller/breeder-management-application-status.controller';
import { BreederManagementApplicationsQueryController } from './controller/breeder-management-applications-query.controller';
import { BreederManagementAvailablePetsController } from './controller/breeder-management-available-pets.controller';
import { BreederManagementDashboardController } from './controller/breeder-management-dashboard.controller';
import { BreederManagementMyPetsController } from './controller/breeder-management-my-pets.controller';
import { BreederManagementParentPetsController } from './controller/breeder-management-parent-pets.controller';
import { BreederManagementProfileInfoController } from './controller/breeder-management-profile-info.controller';
import { BreederManagementReviewReplyController } from './controller/breeder-management-review-reply.controller';
import { BreederManagementReviewsQueryController } from './controller/breeder-management-reviews-query.controller';
import { BreederManagementVerificationCommandController } from './controller/breeder-management-verification-command.controller';
import { BreederManagementVerificationDocumentsController } from './controller/breeder-management-verification-documents.controller';
import { BreederManagementVerificationQueryController } from './controller/breeder-management-verification-query.controller';
import { GetBreederManagementDashboardUseCase } from './application/use-cases/get-breeder-management-dashboard.use-case';
import { GetBreederManagementProfileUseCase } from './application/use-cases/get-breeder-management-profile.use-case';
import { UpdateBreederManagementProfileUseCase } from './application/use-cases/update-breeder-management-profile.use-case';
import { GetBreederManagementReceivedApplicationsUseCase } from './application/use-cases/get-breeder-management-received-applications.use-case';
import { GetBreederManagementMyPetsUseCase } from './application/use-cases/get-breeder-management-my-pets.use-case';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import { GetBreederManagementVerificationStatusUseCase } from './application/use-cases/get-breeder-management-verification-status.use-case';
import { SubmitBreederManagementVerificationUseCase } from './application/use-cases/submit-breeder-management-verification.use-case';
import { GetBreederManagementApplicationFormUseCase } from './application/use-cases/get-breeder-management-application-form.use-case';
import { UpdateBreederManagementApplicationFormUseCase } from './application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from './application/use-cases/update-breeder-management-simple-application-form.use-case';
import { AddBreederManagementParentPetUseCase } from './application/use-cases/add-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from './application/use-cases/update-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from './application/use-cases/remove-breeder-management-parent-pet.use-case';
import { AddBreederManagementAvailablePetUseCase } from './application/use-cases/add-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetUseCase } from './application/use-cases/update-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetStatusUseCase } from './application/use-cases/update-breeder-management-available-pet-status.use-case';
import { RemoveBreederManagementAvailablePetUseCase } from './application/use-cases/remove-breeder-management-available-pet.use-case';
import { AddBreederManagementReviewReplyUseCase } from './application/use-cases/add-breeder-management-review-reply.use-case';
import { UpdateBreederManagementReviewReplyUseCase } from './application/use-cases/update-breeder-management-review-reply.use-case';
import { RemoveBreederManagementReviewReplyUseCase } from './application/use-cases/remove-breeder-management-review-reply.use-case';
import { GetBreederManagementApplicationDetailUseCase } from './application/use-cases/get-breeder-management-application-detail.use-case';
import { UpdateBreederManagementApplicationStatusUseCase } from './application/use-cases/update-breeder-management-application-status.use-case';
import { DeleteBreederManagementAccountUseCase } from './application/use-cases/delete-breeder-management-account.use-case';
import { UploadBreederManagementVerificationDocumentsUseCase } from './application/use-cases/upload-breeder-management-verification-documents.use-case';
import { SubmitBreederManagementVerificationDocumentsUseCase } from './application/use-cases/submit-breeder-management-verification-documents.use-case';
import { BreederManagementDashboardAssemblerService } from './domain/services/breeder-management-dashboard-assembler.service';
import { BreederManagementProfileUpdateMapperService } from './domain/services/breeder-management-profile-update-mapper.service';
import { BreederManagementProfileAssemblerService } from './domain/services/breeder-management-profile-assembler.service';
import { BreederManagementPaginationAssemblerService } from './domain/services/breeder-management-pagination-assembler.service';
import { BreederManagementReceivedApplicationMapperService } from './domain/services/breeder-management-received-application-mapper.service';
import { BreederManagementMyPetMapperService } from './domain/services/breeder-management-my-pet-mapper.service';
import { BreederManagementMyReviewMapperService } from './domain/services/breeder-management-my-review-mapper.service';
import { BreederManagementStandardQuestionCatalogService } from './domain/services/breeder-management-standard-question-catalog.service';
import { BreederManagementVerificationStatusAssemblerService } from './domain/services/breeder-management-verification-status-assembler.service';
import { BreederManagementVerificationSubmissionMapperService } from './domain/services/breeder-management-verification-submission-mapper.service';
import { BreederManagementVerificationOriginalFileNameService } from './domain/services/breeder-management-verification-original-file-name.service';
import { BreederManagementVerificationDocumentPolicyService } from './domain/services/breeder-management-verification-document-policy.service';
import { BreederManagementVerificationNotificationPayloadFactoryService } from './domain/services/breeder-management-verification-notification-payload-factory.service';
import { BreederManagementApplicationFormAssemblerService } from './domain/services/breeder-management-application-form-assembler.service';
import { BreederManagementApplicationFormValidatorService } from './domain/services/breeder-management-application-form-validator.service';
import { BreederManagementSimpleApplicationFormBuilderService } from './domain/services/breeder-management-simple-application-form-builder.service';
import { BreederManagementParentPetCommandMapperService } from './domain/services/breeder-management-parent-pet-command-mapper.service';
import { BreederManagementAvailablePetCommandMapperService } from './domain/services/breeder-management-available-pet-command-mapper.service';
import { BreederManagementAccountCommandResultMapperService } from './domain/services/breeder-management-account-command-result-mapper.service';
import { BreederManagementApplicationCommandResultMapperService } from './domain/services/breeder-management-application-command-result-mapper.service';
import { BreederManagementApplicationStatusResultMapperService } from './domain/services/breeder-management-application-status-result-mapper.service';
import { BreederManagementApplicationDetailAssemblerService } from './domain/services/breeder-management-application-detail-assembler.service';
import { BreederManagementAvailablePetCommandResultMapperService } from './domain/services/breeder-management-available-pet-command-result-mapper.service';
import { BreederManagementAvailablePetStatusResultMapperService } from './domain/services/breeder-management-available-pet-status-result-mapper.service';
import { BreederManagementParentPetCommandResultMapperService } from './domain/services/breeder-management-parent-pet-command-result-mapper.service';
import { BreederManagementProfileCommandResultMapperService } from './domain/services/breeder-management-profile-command-result-mapper.service';
import { BreederManagementReviewReplyResultMapperService } from './domain/services/breeder-management-review-reply-result-mapper.service';
import { BreederManagementVerificationCommandResultMapperService } from './domain/services/breeder-management-verification-command-result-mapper.service';
import { BreederManagementProfileAdapter } from './infrastructure/breeder-management-profile.adapter';
import { BreederManagementListReaderAdapter } from './infrastructure/breeder-management-list-reader.adapter';
import { BreederManagementSettingsAdapter } from './infrastructure/breeder-management-settings.adapter';
import { BreederManagementPetCommandAdapter } from './infrastructure/breeder-management-pet-command.adapter';
import { BreederManagementReviewReplyAdapter } from './infrastructure/breeder-management-review-reply.adapter';
import { BreederManagementApplicationWorkflowAdapter } from './infrastructure/breeder-management-application-workflow.adapter';
import { BreederManagementAccountCommandAdapter } from './infrastructure/breeder-management-account-command.adapter';
import { BreederManagementVerificationDocumentStoreAdapter } from './infrastructure/breeder-management-verification-document-store.adapter';
import { BreederManagementVerificationDraftStoreAdapter } from './infrastructure/breeder-management-verification-draft-store.adapter';
import { BreederManagementVerificationNotifierAdapter } from './infrastructure/breeder-management-verification-notifier.adapter';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from './application/ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_LIST_READER_PORT } from './application/ports/breeder-management-list-reader.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from './application/ports/breeder-management-settings.port';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from './application/ports/breeder-management-pet-command.port';
import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from './application/ports/breeder-management-review-reply.port';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from './application/ports/breeder-management-application-workflow.port';
import { BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT } from './application/ports/breeder-management-account-command.port';
import { BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT } from './application/ports/breeder-management-verification-document-store.port';
import { BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT } from './application/ports/breeder-management-verification-draft-store.port';
import { BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT } from './application/ports/breeder-management-verification-notifier.port';
import { BreederRepository } from './repository/breeder.repository';
import { ParentPetRepository } from './repository/parent-pet.repository';
import { AdoptionApplicationRepository } from './repository/adoption-application.repository';
import { AvailablePetManagementRepository } from './repository/available-pet-management.repository';
import { BreederManagementAdopterRepository } from './repository/breeder-management-adopter.repository';
import { BreederManagementBreederReviewRepository } from './repository/breeder-review.repository';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../schema/adoption-application.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';
import { StorageModule } from '../../common/storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../../common/mail/mail.module';
import { DiscordWebhookModule } from '../../common/discord/discord-webhook.module';
import { BreederManagementSharedModule } from './shared/breeder-management-shared.module';
import { BreederManagementAdminBannerModule } from './admin/breeder-management-admin-banner.module';

const BREEDER_MANAGEMENT_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
    { name: BreederReview.name, schema: BreederReviewSchema },
]);

export const BREEDER_MANAGEMENT_MODULE_IMPORTS = [
    BREEDER_MANAGEMENT_SCHEMA_IMPORTS,
    StorageModule,
    MailModule,
    NotificationModule,
    DiscordWebhookModule,
    // 슬라이스 공통 capability (FILE_URL_PORT)
    BreederManagementSharedModule,
    // 관리자 배너 슬라이스 (자기 DI 소유, GET_ACTIVE_PROFILE_BANNERS_QUERY 노출)
    BreederManagementAdminBannerModule,
];

export const BREEDER_MANAGEMENT_MODULE_CONTROLLERS = [
    BreederManagementDashboardController,
    BreederManagementProfileInfoController,
    BreederManagementVerificationQueryController,
    BreederManagementVerificationCommandController,
    BreederManagementVerificationDocumentsController,
    BreederManagementParentPetsController,
    BreederManagementAvailablePetsController,
    BreederManagementMyPetsController,
    BreederManagementApplicationsQueryController,
    BreederManagementApplicationStatusController,
    BreederManagementApplicationFormQueryController,
    BreederManagementApplicationFormCommandController,
    BreederManagementReviewsQueryController,
    BreederManagementReviewReplyController,
    BreederManagementAccountController,
];

const BREEDER_MANAGEMENT_REPOSITORY_PROVIDERS = [
    BreederRepository,
    ParentPetRepository,
    AdoptionApplicationRepository,
    AvailablePetManagementRepository,
    BreederManagementAdopterRepository,
    BreederManagementBreederReviewRepository,
];

const BREEDER_MANAGEMENT_USE_CASE_PROVIDERS = [
    GetBreederManagementDashboardUseCase,
    GetBreederManagementProfileUseCase,
    UpdateBreederManagementProfileUseCase,
    GetBreederManagementReceivedApplicationsUseCase,
    GetBreederManagementMyPetsUseCase,
    GetBreederManagementMyReviewsUseCase,
    GetBreederManagementVerificationStatusUseCase,
    SubmitBreederManagementVerificationUseCase,
    GetBreederManagementApplicationFormUseCase,
    UpdateBreederManagementApplicationFormUseCase,
    UpdateBreederManagementSimpleApplicationFormUseCase,
    AddBreederManagementParentPetUseCase,
    UpdateBreederManagementParentPetUseCase,
    RemoveBreederManagementParentPetUseCase,
    AddBreederManagementAvailablePetUseCase,
    UpdateBreederManagementAvailablePetUseCase,
    UpdateBreederManagementAvailablePetStatusUseCase,
    RemoveBreederManagementAvailablePetUseCase,
    AddBreederManagementReviewReplyUseCase,
    UpdateBreederManagementReviewReplyUseCase,
    RemoveBreederManagementReviewReplyUseCase,
    GetBreederManagementApplicationDetailUseCase,
    UpdateBreederManagementApplicationStatusUseCase,
    DeleteBreederManagementAccountUseCase,
    UploadBreederManagementVerificationDocumentsUseCase,
    SubmitBreederManagementVerificationDocumentsUseCase,
];

const BREEDER_MANAGEMENT_DOMAIN_PROVIDERS = [
    BreederManagementDashboardAssemblerService,
    BreederManagementProfileUpdateMapperService,
    BreederManagementProfileAssemblerService,
    BreederManagementPaginationAssemblerService,
    BreederManagementReceivedApplicationMapperService,
    BreederManagementMyPetMapperService,
    BreederManagementMyReviewMapperService,
    BreederManagementStandardQuestionCatalogService,
    BreederManagementVerificationStatusAssemblerService,
    BreederManagementVerificationSubmissionMapperService,
    BreederManagementVerificationOriginalFileNameService,
    BreederManagementVerificationDocumentPolicyService,
    BreederManagementVerificationNotificationPayloadFactoryService,
    BreederManagementApplicationFormAssemblerService,
    BreederManagementApplicationFormValidatorService,
    BreederManagementSimpleApplicationFormBuilderService,
    BreederManagementParentPetCommandMapperService,
    BreederManagementAvailablePetCommandMapperService,
    BreederManagementProfileCommandResultMapperService,
    BreederManagementApplicationCommandResultMapperService,
    BreederManagementApplicationStatusResultMapperService,
    BreederManagementParentPetCommandResultMapperService,
    BreederManagementAvailablePetCommandResultMapperService,
    BreederManagementAvailablePetStatusResultMapperService,
    BreederManagementVerificationCommandResultMapperService,
    BreederManagementReviewReplyResultMapperService,
    BreederManagementAccountCommandResultMapperService,
    BreederManagementApplicationDetailAssemblerService,
];

const BREEDER_MANAGEMENT_INFRASTRUCTURE_PROVIDERS = [
    BreederManagementProfileAdapter,
    BreederManagementListReaderAdapter,
    BreederManagementSettingsAdapter,
    BreederManagementPetCommandAdapter,
    BreederManagementReviewReplyAdapter,
    BreederManagementApplicationWorkflowAdapter,
    BreederManagementAccountCommandAdapter,
    BreederManagementVerificationDocumentStoreAdapter,
    BreederManagementVerificationDraftStoreAdapter,
    BreederManagementVerificationNotifierAdapter,
];

const BREEDER_MANAGEMENT_PORT_BINDINGS = [
    {
        provide: BREEDER_MANAGEMENT_PROFILE_PORT,
        useExisting: BreederManagementProfileAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_LIST_READER_PORT,
        useExisting: BreederManagementListReaderAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_SETTINGS_PORT,
        useExisting: BreederManagementSettingsAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_PET_COMMAND_PORT,
        useExisting: BreederManagementPetCommandAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_REVIEW_REPLY_PORT,
        useExisting: BreederManagementReviewReplyAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT,
        useExisting: BreederManagementApplicationWorkflowAdapter,
    },
    {
        provide: BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT,
        useExisting: BreederManagementAccountCommandAdapter,
    },
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

export const BREEDER_MANAGEMENT_MODULE_PROVIDERS = [
    ...BREEDER_MANAGEMENT_REPOSITORY_PROVIDERS,
    ...BREEDER_MANAGEMENT_USE_CASE_PROVIDERS,
    ...BREEDER_MANAGEMENT_DOMAIN_PROVIDERS,
    ...BREEDER_MANAGEMENT_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_MANAGEMENT_PORT_BINDINGS,
];

export const BREEDER_MANAGEMENT_MODULE_EXPORTS = [
    // 관리자 배너 슬라이스를 재노출 → GET_ACTIVE_PROFILE_BANNERS_QUERY 가 auth 배너 컨트롤러에 전달됨
    BreederManagementAdminBannerModule,
    BreederRepository,
    AvailablePetManagementRepository,
];
