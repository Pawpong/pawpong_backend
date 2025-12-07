import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederManagementController } from './breeder-management.controller';

import { BreederManagementService } from './breeder-management.service';

import { BreederRepository } from './repository/breeder.repository';
import { ParentPetRepository } from './repository/parent-pet.repository';
import { AdoptionApplicationRepository } from './repository/adoption-application.repository';
import { AvailablePetManagementRepository } from './repository/available-pet-management.repository';

import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../schema/adoption-application.schema';

import { StorageModule } from '../../common/storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
        ]),
        StorageModule,
        MailModule,
        NotificationModule,
    ],
    controllers: [BreederManagementController],
    providers: [
        BreederManagementService,
        BreederRepository,
        ParentPetRepository,
        AdoptionApplicationRepository,
        AvailablePetManagementRepository,
    ],
    exports: [BreederManagementService, BreederRepository, AvailablePetManagementRepository],
})
export class BreederManagementModule {}
