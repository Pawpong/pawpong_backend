import { MongooseModule } from '@nestjs/mongoose';

import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Banner, BannerSchema } from '../../schema/banner.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Faq, FaqSchema } from '../../schema/faq.schema';
import { StorageModule } from '../../common/storage/storage.module';

import { HOME_ASSET_URL_PORT } from './application/ports/home-asset-url.port';
import { HOME_CONTENT_READER_PORT } from './application/ports/home-content-reader.port';
import { GetActiveBannersUseCase } from './application/use-cases/get-active-banners.use-case';
import { GetAvailablePetsUseCase } from './application/use-cases/get-available-pets.use-case';
import { GetFaqsUseCase } from './application/use-cases/get-faqs.use-case';
import { HomeAvailablePetsController } from './home-available-pets.controller';
import { HomeBannersController } from './home-banners.controller';
import { HomeFaqsController } from './home-faqs.controller';
import { HomeAvailablePetCatalogService } from './domain/services/home-available-pet-catalog.service';
import { HomeBannerCatalogService } from './domain/services/home-banner-catalog.service';
import { HomeFaqCatalogService } from './domain/services/home-faq-catalog.service';
import { HomeMongooseContentReaderAdapter } from './infrastructure/home-mongoose-content-reader.adapter';
import { HomeStorageAssetUrlAdapter } from './infrastructure/home-storage-asset-url.adapter';
import { AvailablePetRepository } from './repository/available-pet.repository';
import { BannerRepository } from './repository/banner.repository';
import { FaqRepository } from './repository/faq.repository';

const HOME_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Banner.name, schema: BannerSchema },
    { name: Faq.name, schema: FaqSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
]);

export const HOME_MODULE_IMPORTS = [HOME_SCHEMA_IMPORTS, StorageModule];

export const HOME_MODULE_CONTROLLERS = [
    HomeBannersController,
    HomeFaqsController,
    HomeAvailablePetsController,
];

const HOME_USE_CASE_PROVIDERS = [GetActiveBannersUseCase, GetFaqsUseCase, GetAvailablePetsUseCase];

const HOME_DOMAIN_PROVIDERS = [
    HomeBannerCatalogService,
    HomeFaqCatalogService,
    HomeAvailablePetCatalogService,
];

const HOME_INFRASTRUCTURE_PROVIDERS = [
    AvailablePetRepository,
    BannerRepository,
    FaqRepository,
    HomeMongooseContentReaderAdapter,
    HomeStorageAssetUrlAdapter,
];

const HOME_PORT_BINDINGS = [
    {
        provide: HOME_CONTENT_READER_PORT,
        useExisting: HomeMongooseContentReaderAdapter,
    },
    {
        provide: HOME_ASSET_URL_PORT,
        useExisting: HomeStorageAssetUrlAdapter,
    },
];

export const HOME_MODULE_PROVIDERS = [
    ...HOME_USE_CASE_PROVIDERS,
    ...HOME_DOMAIN_PROVIDERS,
    ...HOME_INFRASTRUCTURE_PROVIDERS,
    ...HOME_PORT_BINDINGS,
];
