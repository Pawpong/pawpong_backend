import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlatformAdminController } from './platform-admin.controller';
import { PlatformAdminSystemHealthController } from './platform-admin-system-health.controller';

import { PlatformAdminService } from './platform-admin.service';
import { GetSystemHealthUseCase } from './application/use-cases/get-system-health.use-case';
import { LogCategorizerService } from './domain/services/log-categorizer.service';
import { LokiQueryAdapter } from './infrastructure/loki-query.adapter';
import { LOKI_QUERY_PORT } from './application/ports/loki-query.port';

import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { SystemStats, SystemStatsSchema } from '../../../schema/system-stats.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';

/**
 * 플랫폼 Admin 모듈
 *
 * 플랫폼 전체 통계 및 시스템 헬스 관련 관리자 기능을 제공합니다:
 * - 플랫폼 통계 조회
 * - MVP 통계 조회
 * - 시스템 헬스 조회 (Loki 로그 분석)
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
    controllers: [PlatformAdminController, PlatformAdminSystemHealthController],
    providers: [
        PlatformAdminService,
        GetSystemHealthUseCase,
        LogCategorizerService,
        {
            provide: LOKI_QUERY_PORT,
            useClass: LokiQueryAdapter,
        },
    ],
    exports: [PlatformAdminService],
})
export class PlatformAdminModule {}
