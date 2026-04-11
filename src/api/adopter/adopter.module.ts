import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdopterAccountController } from './adopter-account.controller';
import { AdopterAdminApplicationController } from './admin/adopter-admin-application.controller';
import { AdopterAdminReviewController } from './admin/adopter-admin-review.controller';
import { AdopterApplicationCommandController } from './adopter-application-command.controller';
import { AdopterApplicationQueryController } from './adopter-application-query.controller';
import { AdopterFavoriteCommandController } from './adopter-favorite-command.controller';
import { AdopterFavoriteQueryController } from './adopter-favorite-query.controller';
import { AdopterProfileController } from './adopter-profile.controller';
import { AdopterReportController } from './adopter-report.controller';
import { AdopterReviewCommandController } from './adopter-review-command.controller';
import { AdopterReviewQueryController } from './adopter-review-query.controller';

import { GetAdopterAdminReviewReportsUseCase } from './admin/application/use-cases/get-adopter-admin-review-reports.use-case';
import { DeleteAdopterAdminReviewUseCase } from './admin/application/use-cases/delete-adopter-admin-review.use-case';
import { GetAdopterAdminApplicationListUseCase } from './admin/application/use-cases/get-adopter-admin-application-list.use-case';
import { GetAdopterAdminApplicationDetailUseCase } from './admin/application/use-cases/get-adopter-admin-application-detail.use-case';
import { AdopterAdminPolicyService } from './admin/domain/services/adopter-admin-policy.service';
import { AdopterAdminApplicationDetailPresentationService } from './admin/domain/services/adopter-admin-application-detail-presentation.service';
import { AdopterAdminApplicationListAssemblerService } from './admin/domain/services/adopter-admin-application-list-assembler.service';
import { AdopterAdminPresentationService } from './admin/domain/services/adopter-admin-presentation.service';
import { AdopterAdminActivityLogFactoryService } from './admin/domain/services/adopter-admin-activity-log-factory.service';
import { AdopterAdminReviewReportPresentationService } from './admin/domain/services/adopter-admin-review-report-presentation.service';
import { AdopterAdminReviewResponseService } from './admin/domain/services/adopter-admin-review-response.service';
import { ADOPTER_ADMIN_READER } from './admin/application/ports/adopter-admin-reader.port';
import { ADOPTER_ADMIN_WRITER } from './admin/application/ports/adopter-admin-writer.port';
import { AdopterAdminReaderAdapter } from './admin/infrastructure/adopter-admin-reader.adapter';
import { AdopterAdminWriterAdapter } from './admin/infrastructure/adopter-admin-writer.adapter';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { UpdateAdopterProfileUseCase } from './application/use-cases/update-adopter-profile.use-case';
import { AddFavoriteBreederUseCase } from './application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from './application/use-cases/remove-favorite-breeder.use-case';
import { GetFavoriteBreedersUseCase } from './application/use-cases/get-favorite-breeders.use-case';
import { CreateAdopterApplicationUseCase } from './application/use-cases/create-adopter-application.use-case';
import { CreateAdopterReportUseCase } from './application/use-cases/create-adopter-report.use-case';
import { GetAdopterApplicationsUseCase } from './application/use-cases/get-adopter-applications.use-case';
import { GetAdopterApplicationDetailUseCase } from './application/use-cases/get-adopter-application-detail.use-case';
import { CreateAdopterReviewUseCase } from './application/use-cases/create-adopter-review.use-case';
import { ReportAdopterReviewUseCase } from './application/use-cases/report-adopter-review.use-case';
import { GetAdopterReviewsUseCase } from './application/use-cases/get-adopter-reviews.use-case';
import { GetAdopterReviewDetailUseCase } from './application/use-cases/get-adopter-review-detail.use-case';
import { DeleteAdopterAccountUseCase } from './application/use-cases/delete-adopter-account.use-case';
import { AdopterFavoritePolicyService } from './domain/services/adopter-favorite-policy.service';
import { AdopterPaginationAssemblerService } from './domain/services/adopter-pagination-assembler.service';
import { AdopterApplicationCustomResponseBuilderService } from './domain/services/adopter-application-custom-response-builder.service';
import { AdopterApplicationStandardResponseBuilderService } from './domain/services/adopter-application-standard-response-builder.service';
import { AdopterReportPayloadBuilderService } from './domain/services/adopter-report-payload-builder.service';
import { AdopterReviewPageAssemblerService } from './domain/services/adopter-review-page-assembler.service';
import { AdopterReviewDetailMapperService } from './domain/services/adopter-review-detail-mapper.service';
import { AdopterApplicationListAssemblerService } from './domain/services/adopter-application-list-assembler.service';
import { AdopterApplicationDetailAssemblerService } from './domain/services/adopter-application-detail-assembler.service';
import { AdopterProfileAdapter } from './infrastructure/adopter-profile.adapter';
import { AdopterAdminRepository } from './admin/repository/adopter-admin.repository';
import { AdopterApplicationRepository } from './repository/adopter-application.repository';
import { AdopterBreederFavoriteRepository } from './repository/adopter-breeder-favorite.repository';
import { AdopterReviewRepository } from './repository/adopter-review.repository';
import { AdopterBreederReaderAdapter } from './infrastructure/adopter-breeder-reader.adapter';
import { AdopterPetReaderAdapter } from './infrastructure/adopter-pet-reader.adapter';
import { AdopterApplicationCommandAdapter } from './infrastructure/adopter-application-command.adapter';
import { AdopterApplicationNotifierAdapter } from './infrastructure/adopter-application-notifier.adapter';
import { AdopterReportCommandAdapter } from './infrastructure/adopter-report-command.adapter';
import { AdopterReviewCommandAdapter } from './infrastructure/adopter-review-command.adapter';
import { AdopterReviewNotifierAdapter } from './infrastructure/adopter-review-notifier.adapter';
import { AdopterReviewReaderAdapter } from './infrastructure/adopter-review-reader.adapter';
import { AdopterAccountCommandAdapter } from './infrastructure/adopter-account-command.adapter';
import { AdopterApplicationReaderAdapter } from './infrastructure/adopter-application-reader.adapter';
import { AdopterFileUrlAdapter } from './infrastructure/adopter-file-url.adapter';
import { ADOPTER_PROFILE_PORT } from './application/ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from './application/ports/adopter-breeder-reader.port';
import { AdopterPetReaderPort } from './application/ports/adopter-pet-reader.port';
import { AdopterApplicationCommandPort } from './application/ports/adopter-application-command.port';
import { AdopterApplicationNotifierPort } from './application/ports/adopter-application-notifier.port';
import { AdopterReportCommandPort } from './application/ports/adopter-report-command.port';
import { AdopterReviewCommandPort } from './application/ports/adopter-review-command.port';
import { AdopterReviewNotifierPort } from './application/ports/adopter-review-notifier.port';
import { AdopterReviewReaderPort } from './application/ports/adopter-review-reader.port';
import { AdopterAccountCommandPort } from './application/ports/adopter-account-command.port';
import { ADOPTER_APPLICATION_READER_PORT } from './application/ports/adopter-application-reader.port';
import { ADOPTER_FILE_URL_PORT } from './application/ports/adopter-file-url.port';

import { AdopterRepository } from './repository/adopter.repository';
import { BreederRepository } from '../breeder-management/repository/breeder.repository';
import { AvailablePetManagementRepository } from '../breeder-management/repository/available-pet-management.repository';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../schema/admin.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../schema/adoption-application.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';

import { StorageModule } from '../../common/storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../../common/mail/mail.module';
import { DiscordWebhookModule } from '../../common/discord/discord-webhook.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Adopter.name, schema: AdopterSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
            { name: BreederReview.name, schema: BreederReviewSchema },
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
        ]),
        StorageModule,
        MailModule,
        NotificationModule,
        DiscordWebhookModule,
    ],
    controllers: [
        AdopterProfileController,
        AdopterApplicationCommandController,
        AdopterApplicationQueryController,
        AdopterReviewCommandController,
        AdopterReviewQueryController,
        AdopterFavoriteCommandController,
        AdopterFavoriteQueryController,
        AdopterReportController,
        AdopterAccountController,
        AdopterAdminReviewController,
        AdopterAdminApplicationController,
    ],
    providers: [
        GetAdopterAdminReviewReportsUseCase,
        DeleteAdopterAdminReviewUseCase,
        GetAdopterAdminApplicationListUseCase,
        GetAdopterAdminApplicationDetailUseCase,
        AdopterRepository,
        AdopterAdminRepository,
        AdopterBreederFavoriteRepository,
        AdopterApplicationRepository,
        AdopterReviewRepository,
        BreederRepository,
        AvailablePetManagementRepository,
        AdopterAdminPolicyService,
        AdopterAdminApplicationDetailPresentationService,
        AdopterAdminApplicationListAssemblerService,
        AdopterAdminPresentationService,
        AdopterAdminActivityLogFactoryService,
        AdopterAdminReviewReportPresentationService,
        AdopterAdminReviewResponseService,
        AdopterFavoritePolicyService,
        AdopterPaginationAssemblerService,
        AdopterApplicationCustomResponseBuilderService,
        AdopterApplicationStandardResponseBuilderService,
        AdopterReportPayloadBuilderService,
        AdopterReviewPageAssemblerService,
        AdopterReviewDetailMapperService,
        AdopterApplicationListAssemblerService,
        AdopterApplicationDetailAssemblerService,
        AdopterProfileAdapter,
        AdopterBreederReaderAdapter,
        AdopterPetReaderAdapter,
        AdopterApplicationCommandAdapter,
        AdopterApplicationNotifierAdapter,
        AdopterReportCommandAdapter,
        AdopterReviewCommandAdapter,
        AdopterReviewNotifierAdapter,
        AdopterReviewReaderAdapter,
        AdopterAccountCommandAdapter,
        AdopterApplicationReaderAdapter,
        AdopterFileUrlAdapter,
        AdopterAdminReaderAdapter,
        AdopterAdminWriterAdapter,
        GetAdopterProfileUseCase,
        UpdateAdopterProfileUseCase,
        AddFavoriteBreederUseCase,
        RemoveFavoriteBreederUseCase,
        GetFavoriteBreedersUseCase,
        CreateAdopterApplicationUseCase,
        CreateAdopterReportUseCase,
        CreateAdopterReviewUseCase,
        ReportAdopterReviewUseCase,
        GetAdopterReviewsUseCase,
        GetAdopterReviewDetailUseCase,
        DeleteAdopterAccountUseCase,
        GetAdopterApplicationsUseCase,
        GetAdopterApplicationDetailUseCase,
        {
            provide: ADOPTER_PROFILE_PORT,
            useExisting: AdopterProfileAdapter,
        },
        {
            provide: ADOPTER_ADMIN_READER,
            useExisting: AdopterAdminReaderAdapter,
        },
        {
            provide: ADOPTER_ADMIN_WRITER,
            useExisting: AdopterAdminWriterAdapter,
        },
        {
            provide: ADOPTER_BREEDER_READER_PORT,
            useExisting: AdopterBreederReaderAdapter,
        },
        {
            provide: AdopterPetReaderPort,
            useExisting: AdopterPetReaderAdapter,
        },
        {
            provide: AdopterApplicationCommandPort,
            useExisting: AdopterApplicationCommandAdapter,
        },
        {
            provide: AdopterApplicationNotifierPort,
            useExisting: AdopterApplicationNotifierAdapter,
        },
        {
            provide: AdopterReportCommandPort,
            useExisting: AdopterReportCommandAdapter,
        },
        {
            provide: AdopterReviewCommandPort,
            useExisting: AdopterReviewCommandAdapter,
        },
        {
            provide: AdopterReviewNotifierPort,
            useExisting: AdopterReviewNotifierAdapter,
        },
        {
            provide: AdopterReviewReaderPort,
            useExisting: AdopterReviewReaderAdapter,
        },
        {
            provide: AdopterAccountCommandPort,
            useExisting: AdopterAccountCommandAdapter,
        },
        {
            provide: ADOPTER_APPLICATION_READER_PORT,
            useExisting: AdopterApplicationReaderAdapter,
        },
        {
            provide: ADOPTER_FILE_URL_PORT,
            useExisting: AdopterFileUrlAdapter,
        },
    ],
})
export class AdopterModule {}
