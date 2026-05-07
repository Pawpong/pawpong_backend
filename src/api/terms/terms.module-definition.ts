import { MongooseModule } from '@nestjs/mongoose';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { Terms, TermsSchema } from '../../schema/terms.schema';

import { TERMS_READER_PORT } from './application/ports/terms-reader.port';
import { GetActiveTermByCodeUseCase } from './application/use-cases/get-active-term-by-code.use-case';
import { GetActiveTermsListUseCase } from './application/use-cases/get-active-terms-list.use-case';
import { TermsItemMapperService } from './domain/services/terms-item-mapper.service';
import { TermsMongooseReaderAdapter } from './infrastructure/terms-mongoose-reader.adapter';
import { TermsRepository } from './repository/terms.repository';
import { TermsDetailController } from './terms-detail.controller';
import { TermsListController } from './terms-list.controller';

const TERMS_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Terms.name, schema: TermsSchema }]);

export const TERMS_MODULE_IMPORTS = [TERMS_SCHEMA_IMPORTS];

export const TERMS_MODULE_CONTROLLERS = [TermsListController, TermsDetailController];

const TERMS_USE_CASE_PROVIDERS = [GetActiveTermsListUseCase, GetActiveTermByCodeUseCase];

const TERMS_DOMAIN_PROVIDERS = [TermsItemMapperService];

const TERMS_INFRASTRUCTURE_PROVIDERS = [CustomLoggerService, TermsRepository, TermsMongooseReaderAdapter];

const TERMS_PORT_BINDINGS = [
    {
        provide: TERMS_READER_PORT,
        useExisting: TermsMongooseReaderAdapter,
    },
];

export const TERMS_MODULE_PROVIDERS = [
    ...TERMS_USE_CASE_PROVIDERS,
    ...TERMS_DOMAIN_PROVIDERS,
    ...TERMS_INFRASTRUCTURE_PROVIDERS,
    ...TERMS_PORT_BINDINGS,
];
