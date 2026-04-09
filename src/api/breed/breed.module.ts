import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreedController } from './breed.controller';
import { BreedAdminCommandController } from './admin/breed-admin-command.controller';
import { BreedAdminQueryController } from './admin/breed-admin-query.controller';

import { GetBreedsUseCase } from './application/use-cases/get-breeds.use-case';
import { BreedCatalogService } from './domain/services/breed-catalog.service';
import { BreedAdminPresentationService } from './domain/services/breed-admin-presentation.service';
import { BreedMongooseReaderAdapter } from './infrastructure/breed-mongoose-reader.adapter';
import { BREED_READER } from './application/ports/breed-reader.port';
import { BREED_ADMIN_READER } from './admin/application/ports/breed-admin-reader.port';
import { BREED_WRITER } from './admin/application/ports/breed-writer.port';
import { CreateBreedUseCase } from './admin/application/use-cases/create-breed.use-case';
import { GetAllBreedsAdminUseCase } from './admin/application/use-cases/get-all-breeds-admin.use-case';
import { GetBreedByIdUseCase } from './admin/application/use-cases/get-breed-by-id.use-case';
import { UpdateBreedUseCase } from './admin/application/use-cases/update-breed.use-case';
import { DeleteBreedUseCase } from './admin/application/use-cases/delete-breed.use-case';
import { BreedAdminResponseMessageService } from './admin/domain/services/breed-admin-response-message.service';
import { BreedMongooseAdminReaderAdapter } from './admin/infrastructure/breed-mongoose-admin-reader.adapter';
import { BreedMongooseWriterAdapter } from './admin/infrastructure/breed-mongoose-writer.adapter';
import { BreedRepository } from './repository/breed.repository';

import { Breed, BreedSchema } from '../../schema/breed.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Breed.name, schema: BreedSchema }])],
    controllers: [BreedController, BreedAdminQueryController, BreedAdminCommandController],
    providers: [
        GetBreedsUseCase,
        CreateBreedUseCase,
        GetAllBreedsAdminUseCase,
        GetBreedByIdUseCase,
        UpdateBreedUseCase,
        DeleteBreedUseCase,
        BreedAdminResponseMessageService,
        BreedCatalogService,
        BreedAdminPresentationService,
        BreedRepository,
        BreedMongooseReaderAdapter,
        BreedMongooseAdminReaderAdapter,
        BreedMongooseWriterAdapter,
        {
            provide: BREED_READER,
            useExisting: BreedMongooseReaderAdapter,
        },
        {
            provide: BREED_ADMIN_READER,
            useExisting: BreedMongooseAdminReaderAdapter,
        },
        {
            provide: BREED_WRITER,
            useExisting: BreedMongooseWriterAdapter,
        },
    ],
})
export class BreedModule {}
