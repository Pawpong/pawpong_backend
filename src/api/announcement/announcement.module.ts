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
        AnnouncementResponseMapperService,
        AnnouncementMongoosePublicReaderAdapter,
        {
            provide: AnnouncementPublicReaderPort,
            useExisting: AnnouncementMongoosePublicReaderAdapter,
        },
        CustomLoggerService,
    ],
    exports: [AnnouncementService, AnnouncementAdminService],
})
export class AnnouncementModule {}
