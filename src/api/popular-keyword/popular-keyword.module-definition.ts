import { MongooseModule } from '@nestjs/mongoose';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { PopularKeyword, PopularKeywordSchema } from '../../schema/popular-keyword.schema';

import { POPULAR_KEYWORD_ADMIN_READER_PORT } from './admin/application/ports/popular-keyword-admin-reader.port';
import { POPULAR_KEYWORD_WRITER_PORT } from './admin/application/ports/popular-keyword-writer.port';
import { CreatePopularKeywordUseCase } from './admin/application/use-cases/create-popular-keyword.use-case';
import { DeletePopularKeywordUseCase } from './admin/application/use-cases/delete-popular-keyword.use-case';
import { GetAllPopularKeywordsAdminUseCase } from './admin/application/use-cases/get-all-popular-keywords-admin.use-case';
import { GetPopularKeywordByIdUseCase } from './admin/application/use-cases/get-popular-keyword-by-id.use-case';
import { UpdatePopularKeywordUseCase } from './admin/application/use-cases/update-popular-keyword.use-case';
import { PopularKeywordAdminMongooseReaderAdapter } from './admin/infrastructure/popular-keyword-admin-mongoose-reader.adapter';
import { PopularKeywordMongooseWriterAdapter } from './admin/infrastructure/popular-keyword-mongoose-writer.adapter';
import { PopularKeywordAdminCommandController } from './admin/popular-keyword-admin-command.controller';
import { PopularKeywordAdminQueryController } from './admin/popular-keyword-admin-query.controller';
import { POPULAR_KEYWORD_READER_PORT } from './application/ports/popular-keyword-reader.port';
import { GetActivePopularKeywordsUseCase } from './application/use-cases/get-active-popular-keywords.use-case';
import { PopularKeywordItemMapperService } from './domain/services/popular-keyword-item-mapper.service';
import { PopularKeywordMongooseReaderAdapter } from './infrastructure/popular-keyword-mongoose-reader.adapter';
import { PopularKeywordController } from './controller/popular-keyword.controller';
import { PopularKeywordRepository } from './repository/popular-keyword.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: PopularKeyword.name, schema: PopularKeywordSchema }]);

export const POPULAR_KEYWORD_MODULE_IMPORTS = [SCHEMA_IMPORTS];

export const POPULAR_KEYWORD_MODULE_CONTROLLERS = [
    PopularKeywordController,
    PopularKeywordAdminQueryController,
    PopularKeywordAdminCommandController,
];

const USE_CASE_PROVIDERS = [
    GetActivePopularKeywordsUseCase,
    GetAllPopularKeywordsAdminUseCase,
    GetPopularKeywordByIdUseCase,
    CreatePopularKeywordUseCase,
    UpdatePopularKeywordUseCase,
    DeletePopularKeywordUseCase,
];

const DOMAIN_PROVIDERS = [PopularKeywordItemMapperService];

const INFRASTRUCTURE_PROVIDERS = [
    CustomLoggerService,
    PopularKeywordRepository,
    PopularKeywordMongooseReaderAdapter,
    PopularKeywordAdminMongooseReaderAdapter,
    PopularKeywordMongooseWriterAdapter,
];

const PORT_BINDINGS = [
    { provide: POPULAR_KEYWORD_READER_PORT, useExisting: PopularKeywordMongooseReaderAdapter },
    { provide: POPULAR_KEYWORD_ADMIN_READER_PORT, useExisting: PopularKeywordAdminMongooseReaderAdapter },
    { provide: POPULAR_KEYWORD_WRITER_PORT, useExisting: PopularKeywordMongooseWriterAdapter },
];

export const POPULAR_KEYWORD_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
