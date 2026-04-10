import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HomeAdminBannersCommandController } from './home-admin-banners-command.controller';
import { HomeAdminBannersQueryController } from './home-admin-banners-query.controller';
import { HomeAdminFaqsCommandController } from './home-admin-faqs-command.controller';
import { HomeAdminFaqsQueryController } from './home-admin-faqs-query.controller';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import { HOME_ASSET_URL } from '../application/ports/home-asset-url.port';
import { HomeAdminMongooseManagerAdapter } from './infrastructure/home-admin-mongoose-manager.adapter';
import { HOME_ADMIN_MANAGER } from './application/ports/home-admin-manager.port';
import { HomeBannerDeleteResponseMessageService } from '../domain/services/home-banner-delete-response-message.service';
import { HomeBannerCatalogService } from '../domain/services/home-banner-catalog.service';
import { HomeBannerQueryResponseMessageService } from '../domain/services/home-banner-query-response-message.service';
import { HomeBannerWriteResponseMessageService } from '../domain/services/home-banner-write-response-message.service';
import { HomeFaqDeleteResponseMessageService } from '../domain/services/home-faq-delete-response-message.service';
import { HomeFaqQueryResponseMessageService } from '../domain/services/home-faq-query-response-message.service';
import { HomeFaqCatalogService } from '../domain/services/home-faq-catalog.service';
import { HomeFaqWriteResponseMessageService } from '../domain/services/home-faq-write-response-message.service';
import { HomeStorageAssetUrlAdapter } from '../infrastructure/home-storage-asset-url.adapter';
import { BannerRepository } from '../repository/banner.repository';
import { FaqRepository } from '../repository/faq.repository';

import { Faq, FaqSchema } from '../../../schema/faq.schema';
import { Banner, BannerSchema } from '../../../schema/banner.schema';

import { StorageModule } from '../../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Banner.name, schema: BannerSchema },
            { name: Faq.name, schema: FaqSchema },
        ]),
        StorageModule,
    ],
    controllers: [
        HomeAdminBannersQueryController,
        HomeAdminBannersCommandController,
        HomeAdminFaqsQueryController,
        HomeAdminFaqsCommandController,
    ],
    providers: [
        GetAllBannersUseCase,
        CreateBannerUseCase,
        UpdateBannerUseCase,
        DeleteBannerUseCase,
        GetAllFaqsUseCase,
        CreateFaqUseCase,
        UpdateFaqUseCase,
        DeleteFaqUseCase,
        HomeBannerCatalogService,
        HomeFaqCatalogService,
        HomeBannerQueryResponseMessageService,
        HomeBannerWriteResponseMessageService,
        HomeBannerDeleteResponseMessageService,
        HomeFaqQueryResponseMessageService,
        HomeFaqWriteResponseMessageService,
        HomeFaqDeleteResponseMessageService,
        BannerRepository,
        FaqRepository,
        HomeAdminMongooseManagerAdapter,
        HomeStorageAssetUrlAdapter,
        {
            provide: HOME_ADMIN_MANAGER,
            useExisting: HomeAdminMongooseManagerAdapter,
        },
        {
            provide: HOME_ASSET_URL,
            useExisting: HomeStorageAssetUrlAdapter,
        },
    ],
})
export class HomeAdminModule {}
