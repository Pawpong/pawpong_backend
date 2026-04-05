import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdopterController } from './adopter.controller';
import { AdopterAdminController } from './admin/adopter-admin.controller';

import { AdopterService } from './adopter.service';
import { AdopterAdminService } from './admin/adopter-admin.service';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { UpdateAdopterProfileUseCase } from './application/use-cases/update-adopter-profile.use-case';
import { AddFavoriteBreederUseCase } from './application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from './application/use-cases/remove-favorite-breeder.use-case';
import { GetFavoriteBreedersUseCase } from './application/use-cases/get-favorite-breeders.use-case';
import { CreateAdopterApplicationUseCase } from './application/use-cases/create-adopter-application.use-case';
import { CreateAdopterReportUseCase } from './application/use-cases/create-adopter-report.use-case';
import { GetAdopterApplicationsUseCase } from './application/use-cases/get-adopter-applications.use-case';
import { GetAdopterApplicationDetailUseCase } from './application/use-cases/get-adopter-application-detail.use-case';
import { AdopterFavoritePolicyService } from './domain/services/adopter-favorite-policy.service';
import { AdopterApplicationCustomResponseBuilderService } from './domain/services/adopter-application-custom-response-builder.service';
import { AdopterApplicationStandardResponseBuilderService } from './domain/services/adopter-application-standard-response-builder.service';
import { AdopterApplicationCreateResponseFactoryService } from './domain/services/adopter-application-create-response-factory.service';
import { AdopterReportPayloadBuilderService } from './domain/services/adopter-report-payload-builder.service';
import { AdopterReportResponseFactoryService } from './domain/services/adopter-report-response-factory.service';
import { AdopterApplicationListAssemblerService } from './domain/services/adopter-application-list-assembler.service';
import { AdopterApplicationDetailAssemblerService } from './domain/services/adopter-application-detail-assembler.service';
import { AdopterProfileAdapter } from './infrastructure/adopter-profile.adapter';
import { AdopterBreederReaderAdapter } from './infrastructure/adopter-breeder-reader.adapter';
import { AdopterPetReaderAdapter } from './infrastructure/adopter-pet-reader.adapter';
import { AdopterApplicationCommandAdapter } from './infrastructure/adopter-application-command.adapter';
import { AdopterApplicationNotifierAdapter } from './infrastructure/adopter-application-notifier.adapter';
import { AdopterReportCommandAdapter } from './infrastructure/adopter-report-command.adapter';
import { AdopterApplicationReaderAdapter } from './infrastructure/adopter-application-reader.adapter';
import { AdopterFileUrlAdapter } from './infrastructure/adopter-file-url.adapter';
import { ADOPTER_PROFILE_PORT } from './application/ports/adopter-profile.port';
import { ADOPTER_BREEDER_READER_PORT } from './application/ports/adopter-breeder-reader.port';
import { AdopterPetReaderPort } from './application/ports/adopter-pet-reader.port';
import { AdopterApplicationCommandPort } from './application/ports/adopter-application-command.port';
import { AdopterApplicationNotifierPort } from './application/ports/adopter-application-notifier.port';
import { AdopterReportCommandPort } from './application/ports/adopter-report-command.port';
import { ADOPTER_APPLICATION_READER_PORT } from './application/ports/adopter-application-reader.port';
import { ADOPTER_FILE_URL_PORT } from './application/ports/adopter-file-url.port';

import { AdopterRepository } from './adopter.repository';
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
    controllers: [AdopterController, AdopterAdminController],
    providers: [
        AdopterService,
        AdopterAdminService,
        AdopterRepository,
        BreederRepository,
        AvailablePetManagementRepository,
        AdopterFavoritePolicyService,
        AdopterApplicationCustomResponseBuilderService,
        AdopterApplicationStandardResponseBuilderService,
        AdopterApplicationCreateResponseFactoryService,
        AdopterReportPayloadBuilderService,
        AdopterReportResponseFactoryService,
        AdopterApplicationListAssemblerService,
        AdopterApplicationDetailAssemblerService,
        AdopterProfileAdapter,
        AdopterBreederReaderAdapter,
        AdopterPetReaderAdapter,
        AdopterApplicationCommandAdapter,
        AdopterApplicationNotifierAdapter,
        AdopterReportCommandAdapter,
        AdopterApplicationReaderAdapter,
        AdopterFileUrlAdapter,
        GetAdopterProfileUseCase,
        UpdateAdopterProfileUseCase,
        AddFavoriteBreederUseCase,
        RemoveFavoriteBreederUseCase,
        GetFavoriteBreedersUseCase,
        CreateAdopterApplicationUseCase,
        CreateAdopterReportUseCase,
        GetAdopterApplicationsUseCase,
        GetAdopterApplicationDetailUseCase,
        {
            provide: ADOPTER_PROFILE_PORT,
            useExisting: AdopterProfileAdapter,
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
            provide: ADOPTER_APPLICATION_READER_PORT,
            useExisting: AdopterApplicationReaderAdapter,
        },
        {
            provide: ADOPTER_FILE_URL_PORT,
            useExisting: AdopterFileUrlAdapter,
        },
    ],
    exports: [AdopterService, AdopterRepository],
})
export class AdopterModule {}
