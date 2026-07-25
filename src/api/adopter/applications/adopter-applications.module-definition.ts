import { MongooseModule } from '@nestjs/mongoose';

import { MailModule } from '../../../common/mail/mail.module';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';
import { AvailablePet, AvailablePetSchema } from '../../../schema/available-pet.schema';

import { NotificationModule } from '../../notification/notification.module';
import { AdopterSharedModule } from '../shared/adopter-shared.module';
import { AdopterApplicationCommandController } from '../controller/adopter-application-command.controller';
import { AdopterApplicationQueryController } from '../controller/adopter-application-query.controller';
import { CreateAdopterApplicationUseCase } from '../application/use-cases/create-adopter-application.use-case';
import { GetAdopterApplicationsUseCase } from '../application/use-cases/get-adopter-applications.use-case';
import { GetAdopterApplicationDetailUseCase } from '../application/use-cases/get-adopter-application-detail.use-case';
import { AdopterApplicationCreateResultMapperService } from '../domain/services/adopter-application-create-result-mapper.service';
import { AdopterApplicationCustomAnswerBuilderService } from '../domain/services/adopter-application-custom-answer-builder.service';
import { AdopterApplicationStandardAnswerBuilderService } from '../domain/services/adopter-application-standard-answer-builder.service';
import { AdopterApplicationListAssemblerService } from '../domain/services/adopter-application-list-assembler.service';
import { AdopterApplicationDetailAssemblerService } from '../domain/services/adopter-application-detail-assembler.service';
import { AdopterApplicationRepository } from '../repository/adopter-application.repository';
import { AdopterApplicationCommandAdapter } from '../infrastructure/adopter-application-command.adapter';
import { AdopterApplicationReaderAdapter } from '../infrastructure/adopter-application-reader.adapter';
import { AdopterApplicationNotifierAdapter } from '../infrastructure/adopter-application-notifier.adapter';
import { AdopterPetReaderAdapter } from '../infrastructure/adopter-pet-reader.adapter';
import { ADOPTER_APPLICATION_COMMAND_PORT } from '../application/ports/adopter-application-command.port';
import { ADOPTER_APPLICATION_READER_PORT } from '../application/ports/adopter-application-reader.port';
import { ADOPTER_APPLICATION_NOTIFIER_PORT } from '../application/ports/adopter-application-notifier.port';
import { ADOPTER_PET_READER_PORT } from '../application/ports/adopter-pet-reader.port';

// 입양자 > 상담/입양 신청 슬라이스
// 신청 생성 시 브리더에게 알림톡·메일·앱 알림을 발송한다.
const ADOPTER_APPLICATIONS_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
]);

export const ADOPTER_APPLICATIONS_MODULE_IMPORTS = [
    ADOPTER_APPLICATIONS_SCHEMA_IMPORTS,
    AdopterSharedModule,
    MailModule,
    NotificationModule,
];

export const ADOPTER_APPLICATIONS_MODULE_CONTROLLERS = [
    AdopterApplicationCommandController,
    AdopterApplicationQueryController,
];

export const ADOPTER_APPLICATIONS_MODULE_PROVIDERS = [
    CreateAdopterApplicationUseCase,
    GetAdopterApplicationsUseCase,
    GetAdopterApplicationDetailUseCase,
    AdopterApplicationCreateResultMapperService,
    AdopterApplicationCustomAnswerBuilderService,
    AdopterApplicationStandardAnswerBuilderService,
    AdopterApplicationListAssemblerService,
    AdopterApplicationDetailAssemblerService,
    AdopterApplicationRepository,
    AdopterApplicationCommandAdapter,
    AdopterApplicationReaderAdapter,
    AdopterApplicationNotifierAdapter,
    AdopterPetReaderAdapter,
    {
        provide: ADOPTER_APPLICATION_COMMAND_PORT,
        useExisting: AdopterApplicationCommandAdapter,
    },
    {
        provide: ADOPTER_APPLICATION_READER_PORT,
        useExisting: AdopterApplicationReaderAdapter,
    },
    {
        provide: ADOPTER_APPLICATION_NOTIFIER_PORT,
        useExisting: AdopterApplicationNotifierAdapter,
    },
    {
        provide: ADOPTER_PET_READER_PORT,
        useExisting: AdopterPetReaderAdapter,
    },
];
