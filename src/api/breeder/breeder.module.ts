import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BreederController } from './breeder.controller';

import { BreederService } from './breeder.service';
import { BreederExploreService } from './breeder-explore.service';

import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';

import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: BreederReview.name, schema: BreederReviewSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
        ]),
        StorageModule,
    ],
    controllers: [BreederController],
    providers: [BreederService, BreederExploreService],
    exports: [BreederService, BreederExploreService],
})
export class BreederModule {}
