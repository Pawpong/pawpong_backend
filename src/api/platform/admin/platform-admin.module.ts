import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlatformAdminController } from './platform-admin.controller';

import { PlatformAdminService } from './platform-admin.service';

import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { SystemStats, SystemStatsSchema } from '../../../schema/system-stats.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';
import { PhoneWhitelist, PhoneWhitelistSchema } from '../../../schema/phone-whitelist.schema';

/**
 * 플랫폼 Admin 모듈
 *
 * 플랫폼 전체 통계 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - 전화번호 화이트리스트 관리
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: SystemStats.name, schema: SystemStatsSchema },
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
            { name: PhoneWhitelist.name, schema: PhoneWhitelistSchema },
        ]),
    ],
    controllers: [PlatformAdminController],
    providers: [PlatformAdminService],
    exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
