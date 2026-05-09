import { MongooseModule } from '@nestjs/mongoose';

import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';

import { BREEDER_PET_POSTING_PROFILE_PORT } from './application/ports/breeder-pet-posting-profile.port';
import { BREEDER_PET_POSTING_WRITER_PORT } from './application/ports/breeder-pet-posting-writer.port';
import { CreateBreederPetPostingUseCase } from './application/use-cases/create-breeder-pet-posting.use-case';
import { BreederPetPostingCreateController } from './breeder-pet-posting-create.controller';
import { BreederPetPostingMapperService } from './domain/services/breeder-pet-posting-mapper.service';
import { BreederPetPostingValidatorService } from './domain/services/breeder-pet-posting-validator.service';
import { BreederPetPostingProfileMongooseAdapter } from './infrastructure/breeder-pet-posting-profile-mongoose.adapter';
import { BreederPetPostingWriterMongooseAdapter } from './infrastructure/breeder-pet-posting-writer-mongoose.adapter';
import { BreederPetPostingRepository } from './repository/breeder-pet-posting.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const BREEDER_PET_POSTING_MODULE_IMPORTS = [SCHEMA_IMPORTS];

export const BREEDER_PET_POSTING_MODULE_CONTROLLERS = [BreederPetPostingCreateController];

const USE_CASE_PROVIDERS = [CreateBreederPetPostingUseCase];

const DOMAIN_PROVIDERS = [BreederPetPostingValidatorService, BreederPetPostingMapperService];

const INFRASTRUCTURE_PROVIDERS = [
    BreederPetPostingRepository,
    BreederPetPostingProfileMongooseAdapter,
    BreederPetPostingWriterMongooseAdapter,
];

const PORT_BINDINGS = [
    { provide: BREEDER_PET_POSTING_PROFILE_PORT, useExisting: BreederPetPostingProfileMongooseAdapter },
    { provide: BREEDER_PET_POSTING_WRITER_PORT, useExisting: BreederPetPostingWriterMongooseAdapter },
];

export const BREEDER_PET_POSTING_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
