import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { HomeAvailablePetsController } from './home-available-pets.controller';
import { HomeBannersController } from './home-banners.controller';
import { HomeFaqsController } from './home-faqs.controller';
import { HomeAvailablePetCatalogService } from './domain/services/home-available-pet-catalog.service';
import { HomeBannerCatalogService } from './domain/services/home-banner-catalog.service';
import { HomeFaqCatalogService } from './domain/services/home-faq-catalog.service';
import { HOME_ASSET_URL } from './application/ports/home-asset-url.port';
import { HOME_CONTENT_READER } from './application/ports/home-content-reader.port';
import { HomeMongooseContentReaderAdapter } from './infrastructure/home-mongoose-content-reader.adapter';
import { HomeStorageAssetUrlAdapter } from './infrastructure/home-storage-asset-url.adapter';
import { AvailablePetRepository } from './repository/available-pet.repository';
import { BannerRepository } from './repository/banner.repository';
import { FaqRepository } from './repository/faq.repository';

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
    controllers: [HomeBannersController, HomeFaqsController, HomeAvailablePetsController],
    providers: [
        GetActiveBannersUseCase,
        GetFaqsUseCase,
        GetAvailablePetsUseCase,
        HomeBannerCatalogService,
        HomeFaqCatalogService,
        HomeAvailablePetCatalogService,
        AvailablePetRepository,
        BannerRepository,
        FaqRepository,
        HomeMongooseContentReaderAdapter,
        HomeStorageAssetUrlAdapter,
        {
            provide: HOME_CONTENT_READER,
            useExisting: HomeMongooseContentReaderAdapter,
        },
        {
            provide: HOME_ASSET_URL,
            useExisting: HomeStorageAssetUrlAdapter,
        },
    ],
})
export class HomeModule {}
