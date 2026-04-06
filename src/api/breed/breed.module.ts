import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreedController } from './service/breed.controller';
import { AdminBreedController } from './admin/admin-breed.controller';

import { BreedService } from './service/breed.service';
import { AdminBreedService } from './admin/admin-breed.service';
import { GetBreedsUseCase } from './application/use-cases/get-breeds.use-case';
import { BreedCatalogService } from './domain/services/breed-catalog.service';
import { BreedMongooseReaderAdapter } from './infrastructure/breed-mongoose-reader.adapter';
import { BREED_READER } from './application/ports/breed-reader.port';

import { Breed, BreedSchema } from '../../schema/breed.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Breed.name, schema: BreedSchema }])],
    controllers: [BreedController, AdminBreedController],
    providers: [
        BreedService,
        AdminBreedService,
        GetBreedsUseCase,
        BreedCatalogService,
        BreedMongooseReaderAdapter,
        {
            provide: BREED_READER,
            useExisting: BreedMongooseReaderAdapter,
        },
    ],
    exports: [BreedService, AdminBreedService],
})
export class BreedModule {}
