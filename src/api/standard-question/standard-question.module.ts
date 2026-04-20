import { Module } from '@nestjs/common';

import {
    STANDARD_QUESTION_MODULE_CONTROLLERS,
    STANDARD_QUESTION_MODULE_IMPORTS,
    STANDARD_QUESTION_MODULE_PROVIDERS,
} from './standard-question.module-definition';

@Module({
    imports: STANDARD_QUESTION_MODULE_IMPORTS,
    controllers: STANDARD_QUESTION_MODULE_CONTROLLERS,
    providers: STANDARD_QUESTION_MODULE_PROVIDERS,
})
export class StandardQuestionModule {}
