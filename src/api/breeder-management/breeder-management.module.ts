import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederManagementController } from './breeder-management.controller';
import { BreederManagementAdminController } from './admin/breeder-management-admin.controller';

import { BreederManagementService } from './breeder-management.service';
import { BreederManagementAdminService } from './admin/breeder-management-admin.service';
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
import { BreederManagementDashboardAssemblerService } from './domain/services/breeder-management-dashboard-assembler.service';
import { BreederManagementProfileUpdateMapperService } from './domain/services/breeder-management-profile-update-mapper.service';
import { BreederManagementProfileAssemblerService } from './domain/services/breeder-management-profile-assembler.service';
import { BreederManagementReceivedApplicationMapperService } from './domain/services/breeder-management-received-application-mapper.service';
import { BreederManagementMyPetMapperService } from './domain/services/breeder-management-my-pet-mapper.service';
import { BreederManagementMyReviewMapperService } from './domain/services/breeder-management-my-review-mapper.service';
import { BreederManagementStandardQuestionCatalogService } from './domain/services/breeder-management-standard-question-catalog.service';
import { BreederManagementVerificationStatusAssemblerService } from './domain/services/breeder-management-verification-status-assembler.service';
import { BreederManagementVerificationSubmissionMapperService } from './domain/services/breeder-management-verification-submission-mapper.service';
import { BreederManagementApplicationFormAssemblerService } from './domain/services/breeder-management-application-form-assembler.service';
import { BreederManagementApplicationFormValidatorService } from './domain/services/breeder-management-application-form-validator.service';
import { BreederManagementSimpleApplicationFormBuilderService } from './domain/services/breeder-management-simple-application-form-builder.service';
import { BreederManagementParentPetCommandMapperService } from './domain/services/breeder-management-parent-pet-command-mapper.service';
import { BreederManagementAvailablePetCommandMapperService } from './domain/services/breeder-management-available-pet-command-mapper.service';
import { BreederManagementReviewReplyResponseFactoryService } from './domain/services/breeder-management-review-reply-response-factory.service';
import { BreederManagementApplicationDetailAssemblerService } from './domain/services/breeder-management-application-detail-assembler.service';
import { BreederManagementApplicationStatusResponseFactoryService } from './domain/services/breeder-management-application-status-response-factory.service';
import { BreederManagementAccountDeleteResponseFactoryService } from './domain/services/breeder-management-account-delete-response-factory.service';
import { BreederManagementProfileAdapter } from './infrastructure/breeder-management-profile.adapter';
import { BreederManagementFileUrlAdapter } from './infrastructure/breeder-management-file-url.adapter';
import { BreederManagementListReaderAdapter } from './infrastructure/breeder-management-list-reader.adapter';
import { BreederManagementSettingsAdapter } from './infrastructure/breeder-management-settings.adapter';
import { BreederManagementPetCommandAdapter } from './infrastructure/breeder-management-pet-command.adapter';
import { BreederManagementReviewReplyAdapter } from './infrastructure/breeder-management-review-reply.adapter';
import { BreederManagementApplicationWorkflowAdapter } from './infrastructure/breeder-management-application-workflow.adapter';
import { BreederManagementAccountCommandAdapter } from './infrastructure/breeder-management-account-command.adapter';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from './application/ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_FILE_URL_PORT } from './application/ports/breeder-management-file-url.port';
import { BREEDER_MANAGEMENT_LIST_READER_PORT } from './application/ports/breeder-management-list-reader.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from './application/ports/breeder-management-settings.port';
import { BREEDER_MANAGEMENT_PET_COMMAND_PORT } from './application/ports/breeder-management-pet-command.port';
import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from './application/ports/breeder-management-review-reply.port';
import { BREEDER_MANAGEMENT_APPLICATION_WORKFLOW_PORT } from './application/ports/breeder-management-application-workflow.port';
import { BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT } from './application/ports/breeder-management-account-command.port';

import { BreederRepository } from './repository/breeder.repository';
import { ParentPetRepository } from './repository/parent-pet.repository';
import { AdoptionApplicationRepository } from './repository/adoption-application.repository';
import { AvailablePetManagementRepository } from './repository/available-pet-management.repository';

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
    controllers: [BreederManagementController, BreederManagementAdminController],
    providers: [
        BreederManagementService,
        BreederManagementAdminService,
        BreederRepository,
        ParentPetRepository,
        AdoptionApplicationRepository,
        AvailablePetManagementRepository,
        BreederManagementDashboardAssemblerService,
        BreederManagementProfileUpdateMapperService,
        BreederManagementProfileAssemblerService,
        BreederManagementReceivedApplicationMapperService,
        BreederManagementMyPetMapperService,
        BreederManagementMyReviewMapperService,
        BreederManagementStandardQuestionCatalogService,
        BreederManagementVerificationStatusAssemblerService,
        BreederManagementVerificationSubmissionMapperService,
        BreederManagementApplicationFormAssemblerService,
        BreederManagementApplicationFormValidatorService,
        BreederManagementSimpleApplicationFormBuilderService,
        BreederManagementParentPetCommandMapperService,
        BreederManagementAvailablePetCommandMapperService,
        BreederManagementReviewReplyResponseFactoryService,
        BreederManagementApplicationDetailAssemblerService,
        BreederManagementApplicationStatusResponseFactoryService,
        BreederManagementAccountDeleteResponseFactoryService,
        BreederManagementProfileAdapter,
        BreederManagementFileUrlAdapter,
        BreederManagementListReaderAdapter,
        BreederManagementSettingsAdapter,
        BreederManagementPetCommandAdapter,
        BreederManagementReviewReplyAdapter,
        BreederManagementApplicationWorkflowAdapter,
        BreederManagementAccountCommandAdapter,
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
        {
            provide: BREEDER_MANAGEMENT_PROFILE_PORT,
            useExisting: BreederManagementProfileAdapter,
        },
        {
            provide: BREEDER_MANAGEMENT_FILE_URL_PORT,
            useExisting: BreederManagementFileUrlAdapter,
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
    ],
    exports: [
        BreederManagementService,
        BreederManagementAdminService,
        BreederRepository,
        AvailablePetManagementRepository,
    ],
})
export class BreederManagementModule {}
