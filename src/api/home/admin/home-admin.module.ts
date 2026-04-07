import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HomeAdminBannersController } from './home-admin-banners.controller';
import { HomeAdminFaqsController } from './home-admin-faqs.controller';
import { GetAllBannersUseCase } from './application/use-cases/get-all-banners.use-case';
import { CreateBannerUseCase } from './application/use-cases/create-banner.use-case';
import { UpdateBannerUseCase } from './application/use-cases/update-banner.use-case';
import { DeleteBannerUseCase } from './application/use-cases/delete-banner.use-case';
import { GetAllFaqsUseCase } from './application/use-cases/get-all-faqs.use-case';
import { CreateFaqUseCase } from './application/use-cases/create-faq.use-case';
import { UpdateFaqUseCase } from './application/use-cases/update-faq.use-case';
import { DeleteFaqUseCase } from './application/use-cases/delete-faq.use-case';
import { HomeAdminMongooseManagerAdapter } from './infrastructure/home-admin-mongoose-manager.adapter';
import { HOME_ADMIN_MANAGER } from './application/ports/home-admin-manager.port';
import { HomeBannerCatalogService } from '../domain/services/home-banner-catalog.service';
import { HomeFaqCatalogService } from '../domain/services/home-faq-catalog.service';

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
    controllers: [HomeAdminBannersController, HomeAdminFaqsController],
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
        HomeAdminMongooseManagerAdapter,
        {
            provide: HOME_ADMIN_MANAGER,
            useExisting: HomeAdminMongooseManagerAdapter,
        },
    ],
})
export class HomeAdminModule {}
