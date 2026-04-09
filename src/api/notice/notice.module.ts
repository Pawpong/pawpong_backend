import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notice, NoticeSchema } from '../../schema/notice.schema';
import { NoticeController } from './notice.controller';
import { NoticeAdminCommandController } from './admin/notice-admin-command.controller';
import { NoticeAdminQueryController } from './admin/notice-admin-query.controller';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { GetNoticeListUseCase } from './application/use-cases/get-notice-list.use-case';
import { GetNoticeDetailUseCase } from './application/use-cases/get-notice-detail.use-case';
import { NoticePresentationService } from './domain/services/notice-presentation.service';
import { NoticeResponseMessageService } from './domain/services/notice-response-message.service';
import { NoticeMongooseReaderAdapter } from './infrastructure/notice-mongoose-reader.adapter';
import { NOTICE_READER } from './application/ports/notice-reader.port';
import { CreateNoticeUseCase } from './admin/application/use-cases/create-notice.use-case';
import { UpdateNoticeUseCase } from './admin/application/use-cases/update-notice.use-case';
import { DeleteNoticeUseCase } from './admin/application/use-cases/delete-notice.use-case';
import { NoticeMongooseWriterAdapter } from './admin/infrastructure/notice-mongoose-writer.adapter';
import { NOTICE_WRITER } from './admin/application/ports/notice-writer.port';
import { NoticeRepository } from './repository/notice.repository';

/**
 * 공지사항 모듈
 * 공지사항 관련 기능을 제공
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }])],
    controllers: [NoticeController, NoticeAdminQueryController, NoticeAdminCommandController],
    providers: [
        CustomLoggerService,
        GetNoticeListUseCase,
        GetNoticeDetailUseCase,
        NoticePresentationService,
        NoticeResponseMessageService,
        NoticeRepository,
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
})
export class NoticeModule {}
