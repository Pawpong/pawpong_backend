import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Banner, BannerSchema } from '../../schema/banner.schema';
import { Faq, FaqSchema } from '../../schema/faq.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Banner.name, schema: BannerSchema },
            { name: Faq.name, schema: FaqSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
        ]),
        StorageModule,
    ],
    controllers: [HomeController],
    providers: [HomeService],
    exports: [HomeService],
})
export class HomeModule {}
