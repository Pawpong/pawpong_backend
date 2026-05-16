import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../schema/adoption-application.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';

import { AdoptionApplicationCreateController } from './controller/adoption-application-create.controller';
import { ADOPTION_APPLICATION_CONTEXT_PORT } from './application/ports/adoption-application-context.port';
import { ADOPTION_APPLICATION_WRITER_PORT } from './application/ports/adoption-application-writer.port';
import { CreateAdoptionApplicationV2UseCase } from './application/use-cases/create-adoption-application-v2.use-case';
import { AdoptionApplicationPersistMapperService } from './domain/services/adoption-application-persist-mapper.service';
import { AdoptionApplicationValidatorService } from './domain/services/adoption-application-validator.service';
import { AdoptionApplicationContextMongooseAdapter } from './infrastructure/adoption-application-context-mongoose.adapter';
import { AdoptionApplicationWriterMongooseAdapter } from './infrastructure/adoption-application-writer-mongoose.adapter';
import { AdoptionApplicationRepository } from './repository/adoption-application.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
    { name: Adopter.name, schema: AdopterSchema },
]);

export const ADOPTION_APPLICATION_MODULE_IMPORTS = [SCHEMA_IMPORTS];

export const ADOPTION_APPLICATION_MODULE_CONTROLLERS = [AdoptionApplicationCreateController];

const USE_CASE_PROVIDERS = [CreateAdoptionApplicationV2UseCase];

const DOMAIN_PROVIDERS = [AdoptionApplicationValidatorService, AdoptionApplicationPersistMapperService];

const INFRASTRUCTURE_PROVIDERS = [
    AdoptionApplicationRepository,
    AdoptionApplicationContextMongooseAdapter,
    AdoptionApplicationWriterMongooseAdapter,
];

const PORT_BINDINGS = [
    { provide: ADOPTION_APPLICATION_CONTEXT_PORT, useExisting: AdoptionApplicationContextMongooseAdapter },
    { provide: ADOPTION_APPLICATION_WRITER_PORT, useExisting: AdoptionApplicationWriterMongooseAdapter },
];

export const ADOPTION_APPLICATION_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...DOMAIN_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];
