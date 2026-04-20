import { MongooseModule } from '@nestjs/mongoose';

import { Notice, NoticeSchema } from '../../schema/notice.schema';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { NoticeAdminCommandController } from './admin/notice-admin-command.controller';
import { NoticeAdminQueryController } from './admin/notice-admin-query.controller';
import { NOTICE_WRITER_PORT } from './admin/application/ports/notice-writer.port';
import { CreateNoticeUseCase } from './admin/application/use-cases/create-notice.use-case';
import { DeleteNoticeUseCase } from './admin/application/use-cases/delete-notice.use-case';
import { UpdateNoticeUseCase } from './admin/application/use-cases/update-notice.use-case';
import { NoticeMongooseWriterAdapter } from './admin/infrastructure/notice-mongoose-writer.adapter';
import { NoticeController } from './notice.controller';
import { NOTICE_READER_PORT } from './application/ports/notice-reader.port';
import { GetNoticeDetailUseCase } from './application/use-cases/get-notice-detail.use-case';
import { GetNoticeListUseCase } from './application/use-cases/get-notice-list.use-case';
import { NoticeItemMapperService } from './domain/services/notice-item-mapper.service';
import { NoticePageAssemblerService } from './domain/services/notice-page-assembler.service';
import { NoticePaginationAssemblerService } from './domain/services/notice-pagination-assembler.service';
import { NoticeMongooseReaderAdapter } from './infrastructure/notice-mongoose-reader.adapter';
import { NoticeRepository } from './repository/notice.repository';

const NOTICE_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }]);

export const NOTICE_MODULE_IMPORTS = [NOTICE_SCHEMA_IMPORTS];

export const NOTICE_MODULE_CONTROLLERS = [
    NoticeController,
    NoticeAdminQueryController,
    NoticeAdminCommandController,
];

const NOTICE_USE_CASE_PROVIDERS = [
    GetNoticeListUseCase,
    GetNoticeDetailUseCase,
    CreateNoticeUseCase,
    UpdateNoticeUseCase,
    DeleteNoticeUseCase,
];

const NOTICE_DOMAIN_PROVIDERS = [
    NoticePaginationAssemblerService,
    NoticeItemMapperService,
    NoticePageAssemblerService,
];

const NOTICE_INFRASTRUCTURE_PROVIDERS = [
    CustomLoggerService,
    NoticeRepository,
    NoticeMongooseReaderAdapter,
    NoticeMongooseWriterAdapter,
];

const NOTICE_PORT_BINDINGS = [
    {
        provide: NOTICE_READER_PORT,
        useExisting: NoticeMongooseReaderAdapter,
    },
    {
        provide: NOTICE_WRITER_PORT,
        useExisting: NoticeMongooseWriterAdapter,
    },
];

export const NOTICE_MODULE_PROVIDERS = [
    ...NOTICE_USE_CASE_PROVIDERS,
    ...NOTICE_DOMAIN_PROVIDERS,
    ...NOTICE_INFRASTRUCTURE_PROVIDERS,
    ...NOTICE_PORT_BINDINGS,
];
