import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notice, NoticeSchema } from '../../schema/notice.schema';
import { NoticeController } from './notice.controller';
import { NoticeAdminController } from './admin/notice-admin.controller';
import { NoticeService } from './notice.service';
import { NoticeAdminService } from './admin/notice-admin.service';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { GetNoticeListUseCase } from './application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from './application/use-cases/get-notice-detail.use-case';
import { NoticePresentationService } from './domain/services/notice-presentation.service';
import { NoticeMongooseReaderAdapter } from './infrastructure/notice-mongoose-reader.adapter';
import { NOTICE_READER } from './application/ports/notice-reader.port';
import { CreateNoticeUseCase } from './admin/application/use-cases/create-notice.use-case';
import { UpdateNoticeUseCase } from './admin/application/use-cases/update-notice.use-case';
import { DeleteNoticeUseCase } from './admin/application/use-cases/delete-notice.use-case';
import { NoticeMongooseWriterAdapter } from './admin/infrastructure/notice-mongoose-writer.adapter';
import { NOTICE_WRITER } from './admin/application/ports/notice-writer.port';

/**
 * 공지사항 모듈
 * 공지사항 관련 기능을 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }])],
    controllers: [NoticeController, NoticeAdminController],
    providers: [
        NoticeService,
        NoticeAdminService,
        CustomLoggerService,
        GetNoticeListUseCase,
        GetNoticeDetailUseCase,
        NoticePresentationService,
        NoticeMongooseReaderAdapter,
        CreateNoticeUseCase,
        UpdateNoticeUseCase,
        DeleteNoticeUseCase,
        NoticeMongooseWriterAdapter,
        {
            provide: NOTICE_READER,
            useExisting: NoticeMongooseReaderAdapter,
        },
        {
            provide: NOTICE_WRITER,
            useExisting: NoticeMongooseWriterAdapter,
        },
    ],
    exports: [NoticeService, NoticeAdminService],
})
export class NoticeModule {}
