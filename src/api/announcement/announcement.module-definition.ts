import { MongooseModule } from '@nestjs/mongoose';

import { Announcement, AnnouncementSchema } from '../../schema/announcement.schema';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { AnnouncementAdminCommandController } from './admin/announcement-admin-command.controller';
import { AnnouncementAdminQueryController } from './admin/announcement-admin-query.controller';
import { ANNOUNCEMENT_ADMIN_READER_PORT } from './admin/application/ports/announcement-admin-reader.port';
import { ANNOUNCEMENT_WRITER_PORT } from './admin/application/ports/announcement-writer.port';
import { CreateAnnouncementUseCase } from './admin/application/use-cases/create-announcement.use-case';
import { DeleteAnnouncementUseCase } from './admin/application/use-cases/delete-announcement.use-case';
import { GetAllAnnouncementsUseCase } from './admin/application/use-cases/get-all-announcements.use-case';
import { UpdateAnnouncementUseCase } from './admin/application/use-cases/update-announcement.use-case';
import { AnnouncementMongooseAdminReaderAdapter } from './admin/infrastructure/announcement-mongoose-admin-reader.adapter';
import { AnnouncementMongooseWriterAdapter } from './admin/infrastructure/announcement-mongoose-writer.adapter';
import { AnnouncementController } from './announcement.controller';
import { ANNOUNCEMENT_PUBLIC_READER_PORT } from './application/ports/announcement-public-reader.port';
import { GetActiveAnnouncementsUseCase } from './application/use-cases/get-active-announcements.use-case';
import { GetAnnouncementByIdUseCase } from './application/use-cases/get-announcement-by-id.use-case';
import { AnnouncementItemMapperService } from './domain/services/announcement-item-mapper.service';
import { AnnouncementPageAssemblerService } from './domain/services/announcement-page-assembler.service';
import { AnnouncementPaginationAssemblerService } from './domain/services/announcement-pagination-assembler.service';
import { AnnouncementMongoosePublicReaderAdapter } from './infrastructure/announcement-mongoose-public-reader.adapter';
import { AnnouncementRepository } from './repository/announcement.repository';

const ANNOUNCEMENT_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Announcement.name, schema: AnnouncementSchema }]);

export const ANNOUNCEMENT_MODULE_IMPORTS = [ANNOUNCEMENT_SCHEMA_IMPORTS];

export const ANNOUNCEMENT_MODULE_CONTROLLERS = [
    AnnouncementController,
    AnnouncementAdminQueryController,
    AnnouncementAdminCommandController,
];

const ANNOUNCEMENT_USE_CASE_PROVIDERS = [
    GetActiveAnnouncementsUseCase,
    GetAnnouncementByIdUseCase,
    GetAllAnnouncementsUseCase,
    CreateAnnouncementUseCase,
    UpdateAnnouncementUseCase,
    DeleteAnnouncementUseCase,
];

const ANNOUNCEMENT_DOMAIN_PROVIDERS = [
    AnnouncementItemMapperService,
    AnnouncementPageAssemblerService,
    AnnouncementPaginationAssemblerService,
];

const ANNOUNCEMENT_INFRASTRUCTURE_PROVIDERS = [
    CustomLoggerService,
    AnnouncementRepository,
    AnnouncementMongoosePublicReaderAdapter,
    AnnouncementMongooseAdminReaderAdapter,
    AnnouncementMongooseWriterAdapter,
];

const ANNOUNCEMENT_PORT_BINDINGS = [
    {
        provide: ANNOUNCEMENT_PUBLIC_READER_PORT,
        useExisting: AnnouncementMongoosePublicReaderAdapter,
    },
    {
        provide: ANNOUNCEMENT_ADMIN_READER_PORT,
        useExisting: AnnouncementMongooseAdminReaderAdapter,
    },
    {
        provide: ANNOUNCEMENT_WRITER_PORT,
        useExisting: AnnouncementMongooseWriterAdapter,
    },
];

export const ANNOUNCEMENT_MODULE_PROVIDERS = [
    ...ANNOUNCEMENT_USE_CASE_PROVIDERS,
    ...ANNOUNCEMENT_DOMAIN_PROVIDERS,
    ...ANNOUNCEMENT_INFRASTRUCTURE_PROVIDERS,
    ...ANNOUNCEMENT_PORT_BINDINGS,
];
