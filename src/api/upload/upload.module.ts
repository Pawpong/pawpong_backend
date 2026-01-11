import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UploadController } from './upload.controller';
import { UploadAdminController } from './admin/upload-admin.controller';

import { UploadService } from './upload.service';
import { UploadAdminService } from './admin/upload-admin.service';

import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Banner, BannerSchema } from '../../schema/banner.schema';
import { AuthBanner, AuthBannerSchema } from '../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerSchema } from '../../schema/counsel-banner.schema';

import { StorageModule } from '../../common/storage/storage.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Breeder.name, schema: BreederSchema },
            { name: ParentPet.name, schema: ParentPetSchema },
            { name: AvailablePet.name, schema: AvailablePetSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: Banner.name, schema: BannerSchema },
            { name: AuthBanner.name, schema: AuthBannerSchema },
            { name: CounselBanner.name, schema: CounselBannerSchema },
        ]),
        StorageModule,
    ],
    controllers: [
        UploadController,
        UploadAdminController, // 컨트롤러 제외하고 서비스만 테스트
    ],
    providers: [
        UploadService,
        UploadAdminService, // 서비스만 추가
    ],
})
export class UploadModule {}
