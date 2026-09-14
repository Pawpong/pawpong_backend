import { MongooseModule } from '@nestjs/mongoose';

import { LoggerModule } from '../../../common/logger/logger.module';
import { Terms, TermsSchema } from '../../../schema/terms.schema';

import { TermsAdminCommandController } from '../../admin/terms/controller/terms-admin-command.controller';
import { TermsAdminQueryController } from '../../admin/terms/controller/terms-admin-query.controller';
import { TERMS_WRITER_PORT } from '../../admin/terms/application/ports/terms-writer.port';
import { ActivateTermsUseCase } from '../../admin/terms/application/use-cases/activate-terms.use-case';
import { CreateTermsUseCase } from '../../admin/terms/application/use-cases/create-terms.use-case';
import { DeleteTermsUseCase } from '../../admin/terms/application/use-cases/delete-terms.use-case';
import { GetTermsDetailAdminUseCase } from '../../admin/terms/application/use-cases/get-terms-detail-admin.use-case';
import { GetTermsListAdminUseCase } from '../../admin/terms/application/use-cases/get-terms-list-admin.use-case';
import { UpdateTermsUseCase } from '../../admin/terms/application/use-cases/update-terms.use-case';
import { TermsMongooseWriterAdapter } from '../../admin/terms/infrastructure/terms-mongoose-writer.adapter';
import { TERMS_READER_PORT } from './application/ports/terms-reader.port';
import { GetActiveTermByCodeUseCase } from './application/use-cases/get-active-term-by-code.use-case';
import { GetActiveTermsListUseCase } from './application/use-cases/get-active-terms-list.use-case';
import { TermsItemMapperService } from './domain/services/terms-item-mapper.service';
import { TermsMongooseReaderAdapter } from './infrastructure/terms-mongoose-reader.adapter';
import { TermsRepository } from './repository/terms.repository';
import { TermsDetailController } from './controller/terms-detail.controller';
import { TermsListController } from './controller/terms-list.controller';

const TERMS_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Terms.name, schema: TermsSchema }]);

export const TERMS_MODULE_IMPORTS = [TERMS_SCHEMA_IMPORTS, LoggerModule];

export const TERMS_MODULE_CONTROLLERS = [
    TermsListController,
    TermsDetailController,
    TermsAdminQueryController,
    TermsAdminCommandController,
];

const TERMS_USE_CASE_PROVIDERS = [
    GetActiveTermsListUseCase,
    GetActiveTermByCodeUseCase,
    GetTermsListAdminUseCase,
    GetTermsDetailAdminUseCase,
    CreateTermsUseCase,
    UpdateTermsUseCase,
    ActivateTermsUseCase,
    DeleteTermsUseCase,
];

const TERMS_DOMAIN_PROVIDERS = [TermsItemMapperService];

const TERMS_INFRASTRUCTURE_PROVIDERS = [TermsRepository, TermsMongooseReaderAdapter, TermsMongooseWriterAdapter];

const TERMS_PORT_BINDINGS = [
    {
        provide: TERMS_READER_PORT,
        useExisting: TermsMongooseReaderAdapter,
    },
    {
        provide: TERMS_WRITER_PORT,
        useExisting: TermsMongooseWriterAdapter,
    },
];

export const TERMS_MODULE_PROVIDERS = [
    ...TERMS_USE_CASE_PROVIDERS,
    ...TERMS_DOMAIN_PROVIDERS,
    ...TERMS_INFRASTRUCTURE_PROVIDERS,
    ...TERMS_PORT_BINDINGS,
];

// 다른 도메인(예: auth v2)이 활성 약관 검증을 위해 의존할 수 있도록 reader port 만 export
export const TERMS_MODULE_EXPORTS = [
    {
        provide: TERMS_READER_PORT,
        useExisting: TermsMongooseReaderAdapter,
    },
    TermsMongooseReaderAdapter,
];
