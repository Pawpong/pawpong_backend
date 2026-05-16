import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';

import { PROFILE_ASSET_URL_PORT } from './application/ports/profile-asset-url.port';
import { PROFILE_READER_PORT } from './application/ports/profile-reader.port';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetMyFavoriteBreedersUseCase } from './application/use-cases/get-my-favorite-breeders.use-case';
import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { ProfileMapperService } from './domain/services/profile-mapper.service';
import { ProfileAssetUrlStorageAdapter } from './infrastructure/profile-asset-url-storage.adapter';
import { ProfileReaderMongooseAdapter } from './infrastructure/profile-reader-mongoose.adapter';
import { ProfileFavoriteBreedersController, ProfileMeController } from './controller/profile-me.controller';
import { ProfilePublicController } from './controller/profile-public.controller';
import { ProfileRepository } from './repository/profile.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
]);

export const PROFILE_MODULE_IMPORTS = [SCHEMA_IMPORTS, StorageModule];

export const PROFILE_MODULE_CONTROLLERS = [
    ProfileMeController,
    ProfileFavoriteBreedersController,
    ProfilePublicController,
];

const USE_CASE_PROVIDERS = [
    GetMyProfileUseCase,
    GetAdopterProfileUseCase,
    GetBreederProfileUseCase,
    GetMyFavoriteBreedersUseCase,
];

const DOMAIN_PROVIDERS = [ProfileMapperService];

const INFRASTRUCTURE_PROVIDERS = [ProfileRepository, ProfileReaderMongooseAdapter, ProfileAssetUrlStorageAdapter];

const PORT_BINDINGS = [
    { provide: PROFILE_READER_PORT, useExisting: ProfileReaderMongooseAdapter },
    { provide: PROFILE_ASSET_URL_PORT, useExisting: ProfileAssetUrlStorageAdapter },
];

export const PROFILE_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
