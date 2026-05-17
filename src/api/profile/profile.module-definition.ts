import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { UserFollow, UserFollowSchema } from '../../schema/user-follow.schema';

import { PROFILE_ASSET_URL_PORT } from './application/ports/profile-asset-url.port';
import { PROFILE_FOLLOW_PORT } from './application/ports/profile-follow.port';
import { PROFILE_READER_PORT } from './application/ports/profile-reader.port';
import { PROFILE_WRITER_PORT } from './application/ports/profile-writer.port';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetMyFavoriteBreedersUseCase } from './application/use-cases/get-my-favorite-breeders.use-case';
import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { FollowUserUseCase } from './application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from './application/use-cases/unfollow-user.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/update-my-profile.use-case';
import { ProfileMapperService } from './domain/services/profile-mapper.service';
import { ProfileAssetUrlStorageAdapter } from './infrastructure/profile-asset-url-storage.adapter';
import { ProfileFollowMongooseAdapter } from './infrastructure/profile-follow-mongoose.adapter';
import { ProfileReaderMongooseAdapter } from './infrastructure/profile-reader-mongoose.adapter';
import { ProfileWriterMongooseAdapter } from './infrastructure/profile-writer-mongoose.adapter';
import { ProfileFavoriteBreedersController, ProfileMeController } from './controller/profile-me.controller';
import { ProfileFollowController } from './controller/profile-follow.controller';
import { ProfilePublicController } from './controller/profile-public.controller';
import { ProfileFollowRepository } from './repository/profile-follow.repository';
import { ProfileRepository } from './repository/profile.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: UserFollow.name, schema: UserFollowSchema },
]);

export const PROFILE_MODULE_IMPORTS = [SCHEMA_IMPORTS, StorageModule];

export const PROFILE_MODULE_CONTROLLERS = [
    ProfileMeController,
    ProfileFavoriteBreedersController,
    ProfilePublicController,
    ProfileFollowController,
];

const USE_CASE_PROVIDERS = [
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    GetAdopterProfileUseCase,
    GetBreederProfileUseCase,
    GetMyFavoriteBreedersUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
];

const DOMAIN_PROVIDERS = [ProfileMapperService];

const INFRASTRUCTURE_PROVIDERS = [
    ProfileRepository,
    ProfileFollowRepository,
    ProfileReaderMongooseAdapter,
    ProfileWriterMongooseAdapter,
    ProfileAssetUrlStorageAdapter,
    ProfileFollowMongooseAdapter,
];

const PORT_BINDINGS = [
    { provide: PROFILE_READER_PORT, useExisting: ProfileReaderMongooseAdapter },
    { provide: PROFILE_WRITER_PORT, useExisting: ProfileWriterMongooseAdapter },
    { provide: PROFILE_ASSET_URL_PORT, useExisting: ProfileAssetUrlStorageAdapter },
    { provide: PROFILE_FOLLOW_PORT, useExisting: ProfileFollowMongooseAdapter },
];

export const PROFILE_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
