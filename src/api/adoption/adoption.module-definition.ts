import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import { AdopterPetFavorite, AdopterPetFavoriteSchema } from '../../schema/adopter-pet-favorite.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';

import { AdoptionFavoriteController } from './adoption-favorite.controller';
import { AdoptionListController } from './adoption-list.controller';
import {
    ADOPTER_PET_FAVORITE_READER_PORT,
    ADOPTER_PET_FAVORITE_WRITER_PORT,
} from './application/ports/adopter-pet-favorite.port';
import { ADOPTION_ASSET_URL_PORT } from './application/ports/adoption-asset-url.port';
import { ADOPTION_PET_READER_PORT } from './application/ports/adoption-pet-reader.port';
import { AddAdoptionPetFavoriteUseCase } from './application/use-cases/add-adoption-pet-favorite.use-case';
import { GetAdoptionPetListUseCase } from './application/use-cases/get-adoption-pet-list.use-case';
import { GetPopularAdoptionPetsUseCase } from './application/use-cases/get-popular-adoption-pets.use-case';
import { RemoveAdoptionPetFavoriteUseCase } from './application/use-cases/remove-adoption-pet-favorite.use-case';
import { AdoptionPetMapperService } from './domain/services/adoption-pet-mapper.service';
import { AdopterPetFavoriteMongooseAdapter } from './infrastructure/adopter-pet-favorite-mongoose.adapter';
import { AdoptionPetMongooseReaderAdapter } from './infrastructure/adoption-pet-mongoose-reader.adapter';
import { AdoptionStorageAssetUrlAdapter } from './infrastructure/adoption-storage-asset-url.adapter';
import { AdopterPetFavoriteRepository } from './repository/adopter-pet-favorite.repository';
import { AdoptionPetRepository } from './repository/adoption-pet.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: AdopterPetFavorite.name, schema: AdopterPetFavoriteSchema },
]);

export const ADOPTION_MODULE_IMPORTS = [SCHEMA_IMPORTS, StorageModule];

export const ADOPTION_MODULE_CONTROLLERS = [AdoptionListController, AdoptionFavoriteController];

const USE_CASE_PROVIDERS = [
    GetAdoptionPetListUseCase,
    GetPopularAdoptionPetsUseCase,
    AddAdoptionPetFavoriteUseCase,
    RemoveAdoptionPetFavoriteUseCase,
];

const DOMAIN_PROVIDERS = [AdoptionPetMapperService];

const INFRASTRUCTURE_PROVIDERS = [
    AdoptionPetRepository,
    AdopterPetFavoriteRepository,
    AdoptionPetMongooseReaderAdapter,
    AdopterPetFavoriteMongooseAdapter,
    AdoptionStorageAssetUrlAdapter,
];

const PORT_BINDINGS = [
    { provide: ADOPTION_PET_READER_PORT, useExisting: AdoptionPetMongooseReaderAdapter },
    { provide: ADOPTER_PET_FAVORITE_READER_PORT, useExisting: AdopterPetFavoriteMongooseAdapter },
    { provide: ADOPTER_PET_FAVORITE_WRITER_PORT, useExisting: AdopterPetFavoriteMongooseAdapter },
    { provide: ADOPTION_ASSET_URL_PORT, useExisting: AdoptionStorageAssetUrlAdapter },
];

export const ADOPTION_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
