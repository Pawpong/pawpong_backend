import { MongooseModule } from '@nestjs/mongoose';

import { StandardQuestion, StandardQuestionSchema } from '../../schema/standard-question.schema';

import { STANDARD_QUESTION_READER_PORT } from './application/ports/standard-question-reader.port';
import { GetAllActiveStandardQuestionsUseCase } from './application/use-cases/get-all-active-standard-questions.use-case';
import { GetStandardQuestionByIdUseCase } from './application/use-cases/get-standard-question-by-id.use-case';
import { StandardQuestionAdminCommandController } from './admin/standard-question-admin-command.controller';
import { StandardQuestionAdminQueryController } from './admin/standard-question-admin-query.controller';
import { STANDARD_QUESTION_WRITER_PORT } from './admin/application/ports/standard-question-writer.port';
import { GetAllStandardQuestionsUseCase } from './admin/application/use-cases/get-all-standard-questions.use-case';
import { ReorderStandardQuestionsUseCase } from './admin/application/use-cases/reorder-standard-questions.use-case';
import { ReseedStandardQuestionsUseCase } from './admin/application/use-cases/reseed-standard-questions.use-case';
import { ToggleStandardQuestionStatusUseCase } from './admin/application/use-cases/toggle-standard-question-status.use-case';
import { UpdateStandardQuestionUseCase } from './admin/application/use-cases/update-standard-question.use-case';
import { StandardQuestionMongooseWriterAdapter } from './admin/infrastructure/standard-question-mongoose-writer.adapter';
import { StandardQuestionResultMapperService } from './domain/services/standard-question-result-mapper.service';
import { StandardQuestionSeedCatalogService } from './domain/services/standard-question-seed-catalog.service';
import { StandardQuestionMongooseReaderAdapter } from './infrastructure/standard-question-mongoose-reader.adapter';
import { StandardQuestionRepository } from './repository/standard-question.repository';

const STANDARD_QUESTION_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: StandardQuestion.name, schema: StandardQuestionSchema },
]);

export const STANDARD_QUESTION_MODULE_IMPORTS = [STANDARD_QUESTION_SCHEMA_IMPORTS];

export const STANDARD_QUESTION_MODULE_CONTROLLERS = [
    StandardQuestionAdminQueryController,
    StandardQuestionAdminCommandController,
];

const STANDARD_QUESTION_USE_CASE_PROVIDERS = [
    GetAllActiveStandardQuestionsUseCase,
    GetStandardQuestionByIdUseCase,
    GetAllStandardQuestionsUseCase,
    UpdateStandardQuestionUseCase,
    ToggleStandardQuestionStatusUseCase,
    ReorderStandardQuestionsUseCase,
    ReseedStandardQuestionsUseCase,
];

const STANDARD_QUESTION_DOMAIN_PROVIDERS = [StandardQuestionResultMapperService, StandardQuestionSeedCatalogService];

const STANDARD_QUESTION_INFRASTRUCTURE_PROVIDERS = [
    StandardQuestionRepository,
    StandardQuestionMongooseReaderAdapter,
    StandardQuestionMongooseWriterAdapter,
];

const STANDARD_QUESTION_PORT_BINDINGS = [
    {
        provide: STANDARD_QUESTION_READER_PORT,
        useExisting: StandardQuestionMongooseReaderAdapter,
    },
    {
        provide: STANDARD_QUESTION_WRITER_PORT,
        useExisting: StandardQuestionMongooseWriterAdapter,
    },
];

export const STANDARD_QUESTION_MODULE_PROVIDERS = [
    ...STANDARD_QUESTION_USE_CASE_PROVIDERS,
    ...STANDARD_QUESTION_DOMAIN_PROVIDERS,
    ...STANDARD_QUESTION_INFRASTRUCTURE_PROVIDERS,
    ...STANDARD_QUESTION_PORT_BINDINGS,
];
