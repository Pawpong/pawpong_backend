import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../../common/storage/storage.module';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';
import { AvailablePet, AvailablePetSchema } from '../../../schema/available-pet.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { ChatRoom, ChatRoomSchema } from '../../../schema/chat-room.schema';

import { BREEDER_PET_POSTING_ASSET_URL_PORT } from './application/ports/breeder-pet-posting-asset-url.port';
import { BREEDER_PET_POSTING_PROFILE_PORT } from './application/ports/breeder-pet-posting-profile.port';
import { BREEDER_PET_POSTING_READER_PORT } from './application/ports/breeder-pet-posting-reader.port';
import { BREEDER_PET_POSTING_WRITER_PORT } from './application/ports/breeder-pet-posting-writer.port';
import { CreateBreederPetPostingUseCase } from './application/use-cases/create-breeder-pet-posting.use-case';
import { DeleteBreederPetPostingUseCase } from './application/use-cases/delete-breeder-pet-posting.use-case';
import { ListMyBreederPetPostingsUseCase } from './application/use-cases/list-my-breeder-pet-postings.use-case';
import { UpdateBreederPetPostingUseCase } from './application/use-cases/update-breeder-pet-posting.use-case';
import { BreederPetPostingCreateController } from './controller/breeder-pet-posting-create.controller';
import { BreederPetPostingListController } from './controller/breeder-pet-posting-list.controller';
import { BreederPetPostingUpdateController } from './controller/breeder-pet-posting-update.controller';
import { BreederPetPostingCardMapperService } from './domain/services/breeder-pet-posting-card-mapper.service';
import { BreederPetPostingMapperService } from './domain/services/breeder-pet-posting-mapper.service';
import { BreederPetPostingValidatorService } from './domain/services/breeder-pet-posting-validator.service';
import { BreederPetPostingAssetUrlStorageAdapter } from './infrastructure/breeder-pet-posting-asset-url-storage.adapter';
import { BreederPetPostingProfileMongooseAdapter } from './infrastructure/breeder-pet-posting-profile-mongoose.adapter';
import { BreederPetPostingReaderMongooseAdapter } from './infrastructure/breeder-pet-posting-reader-mongoose.adapter';
import { BreederPetPostingWriterMongooseAdapter } from './infrastructure/breeder-pet-posting-writer-mongoose.adapter';
import { BreederPetPostingRepository } from './repository/breeder-pet-posting.repository';

const BREEDER_PET_POSTING_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
    { name: ChatRoom.name, schema: ChatRoomSchema },
]);

export const BREEDER_PET_POSTING_MODULE_IMPORTS = [BREEDER_PET_POSTING_SCHEMA_IMPORTS, StorageModule];

export const BREEDER_PET_POSTING_MODULE_CONTROLLERS = [
    BreederPetPostingCreateController,
    BreederPetPostingListController,
    BreederPetPostingUpdateController,
];

const BREEDER_PET_POSTING_USE_CASE_PROVIDERS = [
    CreateBreederPetPostingUseCase,
    ListMyBreederPetPostingsUseCase,
    UpdateBreederPetPostingUseCase,
    DeleteBreederPetPostingUseCase,
];

const BREEDER_PET_POSTING_DOMAIN_PROVIDERS = [
    BreederPetPostingValidatorService,
    BreederPetPostingMapperService,
    BreederPetPostingCardMapperService,
];

const BREEDER_PET_POSTING_INFRASTRUCTURE_PROVIDERS = [
    BreederPetPostingRepository,
    BreederPetPostingProfileMongooseAdapter,
    BreederPetPostingWriterMongooseAdapter,
    BreederPetPostingReaderMongooseAdapter,
    BreederPetPostingAssetUrlStorageAdapter,
];

const BREEDER_PET_POSTING_PORT_BINDINGS = [
    { provide: BREEDER_PET_POSTING_PROFILE_PORT, useExisting: BreederPetPostingProfileMongooseAdapter },
    { provide: BREEDER_PET_POSTING_WRITER_PORT, useExisting: BreederPetPostingWriterMongooseAdapter },
    { provide: BREEDER_PET_POSTING_READER_PORT, useExisting: BreederPetPostingReaderMongooseAdapter },
    { provide: BREEDER_PET_POSTING_ASSET_URL_PORT, useExisting: BreederPetPostingAssetUrlStorageAdapter },
];

export const BREEDER_PET_POSTING_MODULE_PROVIDERS = [
    ...BREEDER_PET_POSTING_USE_CASE_PROVIDERS,
    ...BREEDER_PET_POSTING_DOMAIN_PROVIDERS,
    ...BREEDER_PET_POSTING_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_PET_POSTING_PORT_BINDINGS,
];
