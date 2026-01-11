import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadController } from './upload.controller';
import { UploadAdminController } from './admin/upload-admin.controller';

import { UploadService } from './upload.service';
import { UploadAdminService } from './admin/upload-admin.service';

import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';

import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
        ]),
        StorageModule,
    ],
    controllers: [
        UploadController,
        // UploadAdminController
    ],
    providers: [
        UploadService,
        // UploadAdminService
    ],
})
export class UploadModule {}
