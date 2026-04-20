import { MongooseModule } from '@nestjs/mongoose';

import { Banner, BannerSchema } from '../../../schema/banner.schema';
import { Faq, FaqSchema } from '../../../schema/faq.schema';
import { StorageModule } from '../../../common/storage/storage.module';

import { HOME_ADMIN_MANAGER_PORT } from './application/ports/home-admin-manager.port';
import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { HomeAdminBannersCommandController } from './home-admin-banners-command.controller';
import { HomeAdminBannersQueryController } from './home-admin-banners-query.controller';
import { HomeAdminFaqsCommandController } from './home-admin-faqs-command.controller';
import { HomeAdminFaqsQueryController } from './home-admin-faqs-query.controller';
import { HomeAdminMongooseManagerAdapter } from './infrastructure/home-admin-mongoose-manager.adapter';
import { HOME_ASSET_URL_PORT } from '../application/ports/home-asset-url.port';
import { HomeBannerCatalogService } from '../domain/services/home-banner-catalog.service';
import { HomeFaqCatalogService } from '../domain/services/home-faq-catalog.service';
import { HomeStorageAssetUrlAdapter } from '../infrastructure/home-storage-asset-url.adapter';
import { BannerRepository } from '../repository/banner.repository';
import { FaqRepository } from '../repository/faq.repository';

const HOME_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Banner.name, schema: BannerSchema },
    { name: Faq.name, schema: FaqSchema },
]);

export const HOME_ADMIN_MODULE_IMPORTS = [HOME_ADMIN_SCHEMA_IMPORTS, StorageModule];

export const HOME_ADMIN_MODULE_CONTROLLERS = [
    HomeAdminBannersQueryController,
    HomeAdminBannersCommandController,
    HomeAdminFaqsQueryController,
    HomeAdminFaqsCommandController,
];

const HOME_ADMIN_USE_CASE_PROVIDERS = [
    GetAllBannersUseCase,
    CreateBannerUseCase,
    UpdateBannerUseCase,
    DeleteBannerUseCase,
    GetAllFaqsUseCase,
    CreateFaqUseCase,
    UpdateFaqUseCase,
    DeleteFaqUseCase,
];

const HOME_ADMIN_DOMAIN_PROVIDERS = [HomeBannerCatalogService, HomeFaqCatalogService];

const HOME_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    BannerRepository,
    FaqRepository,
    HomeAdminMongooseManagerAdapter,
    HomeStorageAssetUrlAdapter,
];

const HOME_ADMIN_PORT_BINDINGS = [
    {
        provide: HOME_ADMIN_MANAGER_PORT,
        useExisting: HomeAdminMongooseManagerAdapter,
    },
    {
        provide: HOME_ASSET_URL_PORT,
        useExisting: HomeStorageAssetUrlAdapter,
    },
];

export const HOME_ADMIN_MODULE_PROVIDERS = [
    ...HOME_ADMIN_USE_CASE_PROVIDERS,
    ...HOME_ADMIN_DOMAIN_PROVIDERS,
    ...HOME_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...HOME_ADMIN_PORT_BINDINGS,
];
