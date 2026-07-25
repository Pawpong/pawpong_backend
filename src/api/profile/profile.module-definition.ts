import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { UserFollow, UserFollowSchema } from '../../schema/user-follow.schema';
import { AdopterModule } from '../adopter/adopter.module';

import { PROFILE_ASSET_URL_PORT } from './application/ports/profile-asset-url.port';
import { PROFILE_FOLLOW_PORT } from './application/ports/profile-follow.port';
import { PROFILE_READER_PORT } from './application/ports/profile-reader.port';
import { PROFILE_WRITER_PORT } from './application/ports/profile-writer.port';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetMyFavoriteBreedersUseCase } from './application/use-cases/get-my-favorite-breeders.use-case';
import { GetMyProfileUseCase } from './application/use-cases/get-my-profile.use-case';
import { FollowUserUseCase } from './application/use-cases/follow-user.use-case';
import { GetUserFollowersUseCase } from './application/use-cases/get-user-followers.use-case';
import { GetUserFollowingsUseCase } from './application/use-cases/get-user-followings.use-case';
import { RemoveMyFollowerUseCase } from './application/use-cases/remove-my-follower.use-case';
import { UnfollowUserUseCase } from './application/use-cases/unfollow-user.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/update-my-profile.use-case';
import { ProfileMapperService } from './domain/services/profile-mapper.service';
import { ProfileAssetUrlStorageAdapter } from './infrastructure/profile-asset-url-storage.adapter';
import { ProfileFollowMongooseAdapter } from './infrastructure/profile-follow-mongoose.adapter';
import { ProfileReaderMongooseAdapter } from './infrastructure/profile-reader-mongoose.adapter';
import { ProfileWriterMongooseAdapter } from './infrastructure/profile-writer-mongoose.adapter';
import { ProfileFavoriteBreedersController, ProfileMeController } from './controller/profile-me.controller';
import { ProfileFollowController, ProfileFollowListController } from './controller/profile-follow.controller';
import { ProfilePublicController } from './controller/profile-public.controller';
import { ProfileFollowRepository } from './repository/profile-follow.repository';
import { ProfileRepository } from './repository/profile.repository';

const PROFILE_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: UserFollow.name, schema: UserFollowSchema },
]);

// AdopterModule: 즐겨찾기 원본 데이터(ADOPTER_FAVORITE_READER_PORT) 조회용.
// adopter 도메인이 Adopter.favoriteBreederList 의 유일한 쓰기 소유자이므로,
// profile 도메인은 자체 쿼리를 재구현하지 않고 이 Port 를 통해서만 읽는다.
export const PROFILE_MODULE_IMPORTS = [PROFILE_SCHEMA_IMPORTS, StorageModule, AdopterModule];

export const PROFILE_MODULE_CONTROLLERS = [
    ProfileMeController,
    ProfileFavoriteBreedersController,
    ProfilePublicController,
    ProfileFollowController,
    ProfileFollowListController,
];

const PROFILE_USE_CASE_PROVIDERS = [
    GetMyProfileUseCase,
    UpdateMyProfileUseCase,
    GetAdopterProfileUseCase,
    GetBreederProfileUseCase,
    GetMyFavoriteBreedersUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    GetUserFollowersUseCase,
    GetUserFollowingsUseCase,
    RemoveMyFollowerUseCase,
];

const PROFILE_DOMAIN_PROVIDERS = [ProfileMapperService];

const PROFILE_INFRASTRUCTURE_PROVIDERS = [
    ProfileRepository,
    ProfileFollowRepository,
    ProfileReaderMongooseAdapter,
    ProfileWriterMongooseAdapter,
    ProfileAssetUrlStorageAdapter,
    ProfileFollowMongooseAdapter,
];

const PROFILE_PORT_BINDINGS = [
    { provide: PROFILE_READER_PORT, useExisting: ProfileReaderMongooseAdapter },
    { provide: PROFILE_WRITER_PORT, useExisting: ProfileWriterMongooseAdapter },
    { provide: PROFILE_ASSET_URL_PORT, useExisting: ProfileAssetUrlStorageAdapter },
    { provide: PROFILE_FOLLOW_PORT, useExisting: ProfileFollowMongooseAdapter },
];

export const PROFILE_MODULE_PROVIDERS = [
    ...PROFILE_USE_CASE_PROVIDERS,
    ...PROFILE_DOMAIN_PROVIDERS,
    ...PROFILE_INFRASTRUCTURE_PROVIDERS,
    ...PROFILE_PORT_BINDINGS,
];
