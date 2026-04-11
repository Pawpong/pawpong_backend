import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederManagementAccountController } from './breeder-management-account.controller';
import { BreederManagementApplicationFormCommandController } from './breeder-management-application-form-command.controller';
import { BreederManagementApplicationFormQueryController } from './breeder-management-application-form-query.controller';
import { BreederManagementApplicationStatusController } from './breeder-management-application-status.controller';
import { BreederManagementApplicationsQueryController } from './breeder-management-applications-query.controller';
import { BreederManagementAvailablePetsController } from './breeder-management-available-pets.controller';
import { BreederManagementDashboardController } from './breeder-management-dashboard.controller';
import { BreederManagementAdminCounselBannersController } from './admin/breeder-management-admin-counsel-banners.controller';
import { BreederManagementAdminProfileBannersController } from './admin/breeder-management-admin-profile-banners.controller';
import { BreederManagementAdminPublicBannersController } from './admin/breeder-management-admin-public-banners.controller';
import { BreederManagementMyPetsController } from './breeder-management-my-pets.controller';
import { BreederManagementParentPetsController } from './breeder-management-parent-pets.controller';
import { BreederManagementProfileInfoController } from './breeder-management-profile-info.controller';
import { BreederManagementReviewReplyController } from './breeder-management-review-reply.controller';
import { BreederManagementReviewsQueryController } from './breeder-management-reviews-query.controller';
import { BreederManagementVerificationCommandController } from './breeder-management-verification-command.controller';
import { BreederManagementVerificationDocumentsController } from './breeder-management-verification-documents.controller';
import { BreederManagementVerificationQueryController } from './breeder-management-verification-query.controller';
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
import { BreederManagementAccountCommandResponseService } from './domain/services/breeder-management-account-command-response.service';
import { BreederManagementApplicationCommandResponseService } from './domain/services/breeder-management-application-command-response.service';
import { BreederManagementApplicationStatusResponseService } from './domain/services/breeder-management-application-status-response.service';
import { BreederManagementApplicationDetailAssemblerService } from './domain/services/breeder-management-application-detail-assembler.service';
import { BreederManagementAvailablePetCommandResponseService } from './domain/services/breeder-management-available-pet-command-response.service';
import { BreederManagementAvailablePetStatusResponseService } from './domain/services/breeder-management-available-pet-status-response.service';
import { BreederManagementParentPetCommandResponseService } from './domain/services/breeder-management-parent-pet-command-response.service';
import { BreederManagementProfileCommandResponseService } from './domain/services/breeder-management-profile-command-response.service';
import { BreederManagementReviewReplyResponseService } from './domain/services/breeder-management-review-reply-response.service';
import { BreederManagementVerificationCommandResponseService } from './domain/services/breeder-management-verification-command-response.service';
import { BreederManagementProfileAdapter } from './infrastructure/breeder-management-profile.adapter';
import { BreederManagementFileUrlAdapter } from './infrastructure/breeder-management-file-url.adapter';
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
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from './application/ports/breeder-management-file-url.port';
import { BREEDER_MANAGEMENT_LIST_READER_PORT } from './application/ports/breeder-management-list-reader.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from './application/ports/breeder-management-settings.port';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from './application/ports/breeder-management-pet-command.port';
import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from './application/ports/breeder-management-review-reply.port';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from './application/ports/breeder-management-application-workflow.port';
import { BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT } from './application/ports/breeder-management-account-command.port';
import { BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT } from './application/ports/breeder-management-verification-document-store.port';
import { BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT } from './application/ports/breeder-management-verification-draft-store.port';
import { BREEDER_MANAGEMENT_VERIFICATION_NOTIFIER_PORT } from './application/ports/breeder-management-verification-notifier.port';
import { BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT } from './admin/application/ports/breeder-management-admin-banner-reader.port';
import { BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT } from './admin/application/ports/breeder-management-admin-banner-writer.port';
import {
    GET_ACTIVE_COUNSEL_BANNERS_QUERY,
    GET_ACTIVE_PROFILE_BANNERS_QUERY,
} from './admin/application/tokens/breeder-management-public-banner-query.token';
import { GetAllProfileBannersUseCase } from './admin/application/use-cases/get-all-profile-banners.use-case';
import { GetActiveProfileBannersUseCase } from './admin/application/use-cases/get-active-profile-banners.use-case';
import { CreateProfileBannerUseCase } from './admin/application/use-cases/create-profile-banner.use-case';
import { UpdateProfileBannerUseCase } from './admin/application/use-cases/update-profile-banner.use-case';
import { DeleteProfileBannerUseCase } from './admin/application/use-cases/delete-profile-banner.use-case';
import { GetAllCounselBannersUseCase } from './admin/application/use-cases/get-all-counsel-banners.use-case';
import { GetActiveCounselBannersUseCase } from './admin/application/use-cases/get-active-counsel-banners.use-case';
import { CreateCounselBannerUseCase } from './admin/application/use-cases/create-counsel-banner.use-case';
import { UpdateCounselBannerUseCase } from './admin/application/use-cases/update-counsel-banner.use-case';
import { DeleteCounselBannerUseCase } from './admin/application/use-cases/delete-counsel-banner.use-case';
import { BreederManagementBannerPresentationService } from './admin/domain/services/breeder-management-banner-presentation.service';
import { BreederManagementAdminBannerReaderAdapter } from './admin/infrastructure/breeder-management-admin-banner-reader.adapter';
import { BreederManagementAdminBannerWriterAdapter } from './admin/infrastructure/breeder-management-admin-banner-writer.adapter';
import { BreederManagementAdminBannerRepository } from './admin/repository/breeder-management-admin-banner.repository';

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
import { AuthBanner, AuthBannerSchema } from '../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerSchema } from '../../schema/counsel-banner.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';

import { StorageModule } from '../../common/storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../../common/mail/mail.module';
import { DiscordWebhookModule } from '../../common/discord/discord-webhook.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
            { name: AuthBanner.name, schema: AuthBannerSchema },
            { name: CounselBanner.name, schema: CounselBannerSchema },
            { name: BreederReview.name, schema: BreederReviewSchema },
        ]),
        StorageModule,
        MailModule,
        NotificationModule,
        DiscordWebhookModule,
    ],
    controllers: [
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
        BreederManagementAdminProfileBannersController,
        BreederManagementAdminCounselBannersController,
        BreederManagementAdminPublicBannersController,
    ],
    providers: [
        BreederRepository,
        ParentPetRepository,
        AdoptionApplicationRepository,
        AvailablePetManagementRepository,
        BreederManagementAdopterRepository,
        BreederManagementBreederReviewRepository,
        BreederManagementAdminBannerRepository,
        GetAllProfileBannersUseCase,
        GetActiveProfileBannersUseCase,
        CreateProfileBannerUseCase,
        UpdateProfileBannerUseCase,
        DeleteProfileBannerUseCase,
        GetAllCounselBannersUseCase,
        GetActiveCounselBannersUseCase,
        CreateCounselBannerUseCase,
        UpdateCounselBannerUseCase,
        DeleteCounselBannerUseCase,
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
        BreederManagementProfileCommandResponseService,
        BreederManagementApplicationCommandResponseService,
        BreederManagementApplicationStatusResponseService,
        BreederManagementParentPetCommandResponseService,
        BreederManagementAvailablePetCommandResponseService,
        BreederManagementAvailablePetStatusResponseService,
        BreederManagementVerificationCommandResponseService,
        BreederManagementReviewReplyResponseService,
        BreederManagementAccountCommandResponseService,
        BreederManagementApplicationDetailAssemblerService,
        BreederManagementBannerPresentationService,
        BreederManagementProfileAdapter,
        BreederManagementFileUrlAdapter,
        BreederManagementAdminBannerReaderAdapter,
        BreederManagementAdminBannerWriterAdapter,
        BreederManagementListReaderAdapter,
        BreederManagementSettingsAdapter,
        BreederManagementPetCommandAdapter,
        BreederManagementReviewReplyAdapter,
        BreederManagementApplicationWorkflowAdapter,
        BreederManagementAccountCommandAdapter,
        BreederManagementVerificationDocumentStoreAdapter,
        BreederManagementVerificationDraftStoreAdapter,
        BreederManagementVerificationNotifierAdapter,
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
        {
            provide: BREEDER_MANAGEMENT_PROFILE_PORT,
            useExisting: BreederManagementProfileAdapter,
        },
        {
            provide: BREEDER_MANAGEMENT_FILE_URL_PORT,
            useExisting: BreederManagementFileUrlAdapter,
        },
        {
            provide: BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT,
            useExisting: BreederManagementAdminBannerReaderAdapter,
        },
        {
            provide: BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER_PORT,
            useExisting: BreederManagementAdminBannerWriterAdapter,
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
        {
            provide: GET_ACTIVE_PROFILE_BANNERS_QUERY,
            useExisting: GetActiveProfileBannersUseCase,
        },
        {
            provide: GET_ACTIVE_COUNSEL_BANNERS_QUERY,
            useExisting: GetActiveCounselBannersUseCase,
        },
    ],
    exports: [
        GET_ACTIVE_PROFILE_BANNERS_QUERY,
        BreederRepository,
        AvailablePetManagementRepository,
    ],
})
export class BreederManagementModule {}
