import { Module } from '@nestjs/common';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { StorageModule } from '../../common/storage/storage.module';
import { BreederDatabaseModule, AdopterDatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [StorageModule, BreederDatabaseModule, AdopterDatabaseModule],
    controllers: [UploadController],
    providers: [UploadService, CustomLoggerService],
})
export class UploadModule {}
