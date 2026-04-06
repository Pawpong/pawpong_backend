import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnnouncementController } from './announcement.controller';
import { AnnouncementAdminController } from './admin/announcement-admin.controller';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { AnnouncementService } from './announcement.service';
import { AnnouncementAdminService } from './admin/announcement-admin.service';
import { AnnouncementPublicReaderPort } from './application/ports/announcement-public-reader.port';
import { GetActiveAnnouncementsUseCase } from './application/use-cases/get-active-announcements.use-case';
import { GetAnnouncementByIdUseCase } from './application/use-cases/get-announcement-by-id.use-case';
import { AnnouncementResponseMapperService } from './domain/services/announcement-response-mapper.service';
import { AnnouncementMongoosePublicReaderAdapter } from './infrastructure/announcement-mongoose-public-reader.adapter';
import { AnnouncementAdminReaderPort } from './admin/application/ports/announcement-admin-reader.port';
import { ANNOUNCEMENT_WRITER } from './admin/application/ports/announcement-writer.port';
import { GetAllAnnouncementsUseCase } from './admin/application/use-cases/get-all-announcements.use-case';
import { CreateAnnouncementUseCase } from './admin/application/use-cases/create-announcement.use-case';
import { UpdateAnnouncementUseCase } from './admin/application/use-cases/update-announcement.use-case';
import { DeleteAnnouncementUseCase } from './admin/application/use-cases/delete-announcement.use-case';
import { AnnouncementMongooseAdminReaderAdapter } from './admin/infrastructure/announcement-mongoose-admin-reader.adapter';
import { AnnouncementMongooseWriterAdapter } from './admin/infrastructure/announcement-mongoose-writer.adapter';

import { Announcement, AnnouncementSchema } from '../../schema/announcement.schema';

/**
 * 공지사항 모듈
 * 공개 API 및 관리자 API 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Announcement.name, schema: AnnouncementSchema }])],
    controllers: [AnnouncementController, AnnouncementAdminController],
    providers: [
        AnnouncementService,
        AnnouncementAdminService,
        GetActiveAnnouncementsUseCase,
        GetAnnouncementByIdUseCase,
        GetAllAnnouncementsUseCase,
        CreateAnnouncementUseCase,
        UpdateAnnouncementUseCase,
        DeleteAnnouncementUseCase,
        AnnouncementResponseMapperService,
        AnnouncementMongoosePublicReaderAdapter,
        AnnouncementMongooseAdminReaderAdapter,
        AnnouncementMongooseWriterAdapter,
        {
            provide: AnnouncementPublicReaderPort,
            useExisting: AnnouncementMongoosePublicReaderAdapter,
        },
        {
            provide: AnnouncementAdminReaderPort,
            useExisting: AnnouncementMongooseAdminReaderAdapter,
        },
        {
            provide: ANNOUNCEMENT_WRITER,
            useExisting: AnnouncementMongooseWriterAdapter,
        },
        CustomLoggerService,
    ],
    exports: [AnnouncementService, AnnouncementAdminService],
})
export class AnnouncementModule {}
