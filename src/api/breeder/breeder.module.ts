import { Module } from '@nestjs/common';

import { BreederController } from './breeder.controller';

import { BreederService } from './breeder.service';
import { BreederExploreService } from './breeder-explore.service';

import { StorageModule } from '../../common/storage/storage.module';
import { BreederDatabaseModule, AdopterDatabaseModule } from '../../common/database/database.module';

@Module({
    imports: [BreederDatabaseModule, AdopterDatabaseModule, StorageModule],
    controllers: [BreederController],
    providers: [BreederService, BreederExploreService],
    exports: [BreederService, BreederExploreService],
})
export class BreederModule {}
