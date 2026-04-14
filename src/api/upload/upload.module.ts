import { Module } from '@nestjs/common';

import {
    UPLOAD_MODULE_CONTROLLERS,
    UPLOAD_MODULE_IMPORTS,
    UPLOAD_MODULE_PROVIDERS,
} from './upload.module-definition';

@Module({
    imports: UPLOAD_MODULE_IMPORTS,
    controllers: UPLOAD_MODULE_CONTROLLERS,
    providers: UPLOAD_MODULE_PROVIDERS,
})
export class UploadModule {}
