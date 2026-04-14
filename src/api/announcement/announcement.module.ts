import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnnouncementController } from './announcement.controller';
import { AnnouncementAdminCommandController } from './admin/announcement-admin-command.controller';
import { AnnouncementAdminQueryController } from './admin/announcement-admin-query.controller';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { ANNOUNCEMENT_PUBLIC_READER_PORT } from './application/ports/announcement-public-reader.port';
import { GetActiveAnnouncementsUseCase } from './application/use-cases/get-active-announcements.use-case';
import { GetAnnouncementByIdUseCase } from './application/use-cases/get-announcement-by-id.use-case';
import { AnnouncementItemMapperService } from './domain/services/announcement-item-mapper.service';
import { AnnouncementPageAssemblerService } from './domain/services/announcement-page-assembler.service';
import { AnnouncementPaginationAssemblerService } from './domain/services/announcement-pagination-assembler.service';
import { AnnouncementMongoosePublicReaderAdapter } from './infrastructure/announcement-mongoose-public-reader.adapter';
import { ANNOUNCEMENT_ADMIN_READER_PORT } from './admin/application/ports/announcement-admin-reader.port';
import { ANNOUNCEMENT_WRITER_PORT } from './admin/application/ports/announcement-writer.port';
import { GetAllAnnouncementsUseCase } from './admin/application/use-cases/get-all-announcements.use-case';
import { CreateAnnouncementUseCase } from './admin/application/use-cases/create-announcement.use-case';
import { UpdateAnnouncementUseCase } from './admin/application/use-cases/update-announcement.use-case';
import { DeleteAnnouncementUseCase } from './admin/application/use-cases/delete-announcement.use-case';
import { AnnouncementMongooseAdminReaderAdapter } from './admin/infrastructure/announcement-mongoose-admin-reader.adapter';
import { AnnouncementMongooseWriterAdapter } from './admin/infrastructure/announcement-mongoose-writer.adapter';
import { AnnouncementRepository } from './repository/announcement.repository';

import { Announcement, AnnouncementSchema } from '../../schema/announcement.schema';

/**
 * 공지사항 모듈
 * 공개 API 및 관리자 API 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Announcement.name, schema: AnnouncementSchema }])],
    controllers: [AnnouncementController, AnnouncementAdminQueryController, AnnouncementAdminCommandController],
    providers: [
        GetActiveAnnouncementsUseCase,
        GetAnnouncementByIdUseCase,
        GetAllAnnouncementsUseCase,
        CreateAnnouncementUseCase,
        UpdateAnnouncementUseCase,
        DeleteAnnouncementUseCase,
        AnnouncementItemMapperService,
        AnnouncementPageAssemblerService,
        AnnouncementPaginationAssemblerService,
        AnnouncementRepository,
        AnnouncementMongoosePublicReaderAdapter,
        AnnouncementMongooseAdminReaderAdapter,
        AnnouncementMongooseWriterAdapter,
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
        CustomLoggerService,
    ],
})
export class AnnouncementModule {}
