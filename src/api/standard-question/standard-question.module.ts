import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StandardQuestionAdminCommandController } from './admin/standard-question-admin-command.controller';
import { StandardQuestionAdminQueryController } from './admin/standard-question-admin-query.controller';

import { STANDARD_QUESTION_READER } from './application/ports/standard-question-reader.port';
import { STANDARD_QUESTION_WRITER } from './admin/application/ports/standard-question-writer.port';
import { GetAllActiveStandardQuestionsUseCase } from './application/use-cases/get-all-active-standard-questions.use-case';
import { GetStandardQuestionByIdUseCase } from './application/use-cases/get-standard-question-by-id.use-case';
import { GetAllStandardQuestionsUseCase } from './admin/application/use-cases/get-all-standard-questions.use-case';
import { UpdateStandardQuestionUseCase } from './admin/application/use-cases/update-standard-question.use-case';
import { ToggleStandardQuestionStatusUseCase } from './admin/application/use-cases/toggle-standard-question-status.use-case';
import { ReorderStandardQuestionsUseCase } from './admin/application/use-cases/reorder-standard-questions.use-case';
import { ReseedStandardQuestionsUseCase } from './admin/application/use-cases/reseed-standard-questions.use-case';
import { StandardQuestionPresentationService } from './domain/services/standard-question-presentation.service';
import { StandardQuestionSeedCatalogService } from './domain/services/standard-question-seed-catalog.service';
import { StandardQuestionAdminQuestionCommandResponseMessageService } from './admin/domain/services/standard-question-admin-question-command-response-message.service';
import { StandardQuestionAdminQueryResponseMessageService } from './admin/domain/services/standard-question-admin-query-response-message.service';
import { StandardQuestionAdminSeedCommandResponseMessageService } from './admin/domain/services/standard-question-admin-seed-command-response-message.service';
import { StandardQuestionMongooseReaderAdapter } from './infrastructure/standard-question-mongoose-reader.adapter';
import { StandardQuestionMongooseWriterAdapter } from './admin/infrastructure/standard-question-mongoose-writer.adapter';
import { StandardQuestionRepository } from './repository/standard-question.repository';

import { StandardQuestion, StandardQuestionSchema } from '../../schema/standard-question.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: StandardQuestion.name, schema: StandardQuestionSchema }])],
    controllers: [StandardQuestionAdminQueryController, StandardQuestionAdminCommandController],
    providers: [
        GetAllActiveStandardQuestionsUseCase,
        GetStandardQuestionByIdUseCase,
        GetAllStandardQuestionsUseCase,
        UpdateStandardQuestionUseCase,
        ToggleStandardQuestionStatusUseCase,
        ReorderStandardQuestionsUseCase,
        ReseedStandardQuestionsUseCase,
        StandardQuestionPresentationService,
        StandardQuestionSeedCatalogService,
        StandardQuestionAdminQueryResponseMessageService,
        StandardQuestionAdminQuestionCommandResponseMessageService,
        StandardQuestionAdminSeedCommandResponseMessageService,
        StandardQuestionRepository,
        StandardQuestionMongooseReaderAdapter,
        StandardQuestionMongooseWriterAdapter,
        {
            provide: STANDARD_QUESTION_READER,
            useExisting: StandardQuestionMongooseReaderAdapter,
        },
        {
            provide: STANDARD_QUESTION_WRITER,
            useExisting: StandardQuestionMongooseWriterAdapter,
        },
    ],
})
export class StandardQuestionModule {}
