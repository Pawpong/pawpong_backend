import { MongooseModule } from '@nestjs/mongoose';

import { Breed, BreedSchema } from '../../schema/breed.schema';

import { BreedAdminCommandController } from './admin/breed-admin-command.controller';
import { BreedAdminQueryController } from './admin/breed-admin-query.controller';
import { BREED_ADMIN_READER_PORT } from './admin/application/ports/breed-admin-reader.port';
import { BREED_WRITER_PORT } from './admin/application/ports/breed-writer.port';
import { CreateBreedUseCase } from './admin/application/use-cases/create-breed.use-case';
import { DeleteBreedUseCase } from './admin/application/use-cases/delete-breed.use-case';
import { GetAllBreedsAdminUseCase } from './admin/application/use-cases/get-all-breeds-admin.use-case';
import { GetBreedByIdUseCase } from './admin/application/use-cases/get-breed-by-id.use-case';
import { UpdateBreedUseCase } from './admin/application/use-cases/update-breed.use-case';
import { BreedMongooseAdminReaderAdapter } from './admin/infrastructure/breed-mongoose-admin-reader.adapter';
import { BreedMongooseWriterAdapter } from './admin/infrastructure/breed-mongoose-writer.adapter';
import { BREED_READER_PORT } from './application/ports/breed-reader.port';
import { GetBreedsUseCase } from './application/use-cases/get-breeds.use-case';
import { BreedController } from './breed.controller';
import { BreedAdminResultMapperService } from './domain/services/breed-admin-result-mapper.service';
import { BreedCatalogService } from './domain/services/breed-catalog.service';
import { BreedMongooseReaderAdapter } from './infrastructure/breed-mongoose-reader.adapter';
import { BreedRepository } from './repository/breed.repository';

const BREED_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Breed.name, schema: BreedSchema }]);

export const BREED_MODULE_IMPORTS = [BREED_SCHEMA_IMPORTS];

export const BREED_MODULE_CONTROLLERS = [
    BreedController,
    BreedAdminQueryController,
    BreedAdminCommandController,
];

const BREED_USE_CASE_PROVIDERS = [
    GetBreedsUseCase,
    CreateBreedUseCase,
    GetAllBreedsAdminUseCase,
    GetBreedByIdUseCase,
    UpdateBreedUseCase,
    DeleteBreedUseCase,
];

const BREED_DOMAIN_PROVIDERS = [BreedCatalogService, BreedAdminResultMapperService];

const BREED_INFRASTRUCTURE_PROVIDERS = [
    BreedRepository,
    BreedMongooseReaderAdapter,
    BreedMongooseAdminReaderAdapter,
    BreedMongooseWriterAdapter,
];

const BREED_PORT_BINDINGS = [
    {
        provide: BREED_READER_PORT,
        useExisting: BreedMongooseReaderAdapter,
    },
    {
        provide: BREED_ADMIN_READER_PORT,
        useExisting: BreedMongooseAdminReaderAdapter,
    },
    {
        provide: BREED_WRITER_PORT,
        useExisting: BreedMongooseWriterAdapter,
    },
];

export const BREED_MODULE_PROVIDERS = [
    ...BREED_USE_CASE_PROVIDERS,
    ...BREED_DOMAIN_PROVIDERS,
    ...BREED_INFRASTRUCTURE_PROVIDERS,
    ...BREED_PORT_BINDINGS,
];
