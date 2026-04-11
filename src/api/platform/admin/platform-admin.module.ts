import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlatformAdminMvpStatsController } from './platform-admin-mvp-stats.controller';
import { PlatformAdminStatsController } from './platform-admin-stats.controller';
import { PLATFORM_ADMIN_READER_PORT } from './application/ports/platform-admin-reader.port';
import { GetPlatformMvpStatsUseCase } from './application/use-cases/get-platform-mvp-stats.use-case';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { PlatformAdminPresentationService } from './domain/services/platform-admin-presentation.service';
import { PlatformAdminQueryPolicyService } from './domain/services/platform-admin-query-policy.service';
import { PlatformAdminMongooseReaderAdapter } from './infrastructure/platform-admin-mongoose-reader.adapter';
import { PlatformAdminRepository } from './repository/platform-admin.repository';

import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { SystemStats, SystemStatsSchema } from '../../../schema/system-stats.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';

/**
 * 플랫폼 Admin 모듈
 *
 * 플랫폼 전체 통계 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - MVP 통계 조회
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: Breeder.name, schema: BreederSchema },
            { name: Adopter.name, schema: AdopterSchema },
            { name: SystemStats.name, schema: SystemStatsSchema },
            { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
        ]),
    ],
    controllers: [PlatformAdminStatsController, PlatformAdminMvpStatsController],
    providers: [
        GetPlatformStatsUseCase,
        GetPlatformMvpStatsUseCase,
        PlatformAdminPresentationService,
        PlatformAdminQueryPolicyService,
        PlatformAdminRepository,
        PlatformAdminMongooseReaderAdapter,
        {
            provide: PLATFORM_ADMIN_READER_PORT,
            useExisting: PlatformAdminMongooseReaderAdapter,
        },
    ],
})
export class PlatformAdminModule {}
