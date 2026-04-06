import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { HomeAvailablePetCatalogService } from './domain/services/home-available-pet-catalog.service';
import { HomeBannerCatalogService } from './domain/services/home-banner-catalog.service';
import { HomeFaqCatalogService } from './domain/services/home-faq-catalog.service';
import { HOME_CONTENT_READER } from './application/ports/home-content-reader.port';
import { HomeMongooseContentReaderAdapter } from './infrastructure/home-mongoose-content-reader.adapter';

import { Faq, FaqSchema } from '../../schema/faq.schema';
import { Banner, BannerSchema } from '../../schema/banner.schema';
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
    providers: [
        HomeService,
        GetActiveBannersUseCase,
        GetFaqsUseCase,
        GetAvailablePetsUseCase,
        HomeBannerCatalogService,
        HomeFaqCatalogService,
        HomeAvailablePetCatalogService,
        HomeMongooseContentReaderAdapter,
        {
            provide: HOME_CONTENT_READER,
            useExisting: HomeMongooseContentReaderAdapter,
        },
    ],
    exports: [HomeService],
})
export class HomeModule {}
