import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdopterController } from './adopter.controller';
import { AdopterAdminController } from './admin/adopter-admin.controller';

import { AdopterService } from './adopter.service';
import { AdopterAdminService } from './admin/adopter-admin.service';

import { AdopterRepository } from './adopter.repository';
import { BreederRepository } from '../breeder-management/repository/breeder.repository';
import { AvailablePetManagementRepository } from '../breeder-management/repository/available-pet-management.repository';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Admin, AdminSchema } from '../../schema/admin.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../schema/adoption-application.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';

import { StorageModule } from '../../common/storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Adopter.name, schema: AdopterSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Admin.name, schema: AdminSchema },
            { name: BreederReview.name, schema: BreederReviewSchema },
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
        ]),
        StorageModule,
        MailModule,
        NotificationModule,
    ],
    controllers: [AdopterController, AdopterAdminController],
    providers: [
        AdopterService,
        AdopterAdminService,
        AdopterRepository,
        BreederRepository,
        AvailablePetManagementRepository,
    ],
    exports: [AdopterService, AdopterRepository],
})
export class AdopterModule {}
