import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';

import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
        ]),
        StorageModule,
    ],
    controllers: [UploadController],
    providers: [UploadService, CustomLoggerService],
})
export class UploadModule {}
