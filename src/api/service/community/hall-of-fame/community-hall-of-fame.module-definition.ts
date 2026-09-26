import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { CommunityHallOfFame, CommunityHallOfFameSchema } from '../../../../schema/community-hall-of-fame.schema';

import { CommunitySharedModule } from '../shared/community-shared.module';
import { CommunityHallOfFameController } from '../controller/community-hall-of-fame.controller';
import { GetCurrentCommunityHallOfFameUseCase } from '../application/use-cases/get-current-community-hall-of-fame.use-case';
import { GetCommunityHallOfFameHistoryUseCase } from '../application/use-cases/get-community-hall-of-fame-history.use-case';
import { RefreshCommunityHallOfFameUseCase } from '../application/use-cases/refresh-community-hall-of-fame.use-case';
import { CommunityHallOfFamePeriodService } from '../domain/services/community-hall-of-fame-period.service';
import { CommunityHallOfFameMapperService } from '../domain/services/community-hall-of-fame-mapper.service';
import { CommunityHallOfFameMongooseAdapter } from '../infrastructure/community-hall-of-fame-mongoose.adapter';
import { CommunityHallOfFamePostReaderMongooseAdapter } from '../infrastructure/community-hall-of-fame-post-reader-mongoose.adapter';
import { CommunityHallOfFameScheduler } from '../infrastructure/community-hall-of-fame.scheduler';
import { COMMUNITY_HALL_OF_FAME_PORT } from '../application/ports/community-hall-of-fame.port';
import { COMMUNITY_HALL_OF_FAME_POST_READER_PORT } from '../application/ports/community-hall-of-fame-post-reader.port';

// 커뮤니티 > 명예의 전당 슬라이스 (회차별 좋아요 TOP3 집계·조회)
// 집계는 매시 정각(KST) 크론과 기동 직후 1회로 돌린다.
export const COMMUNITY_HALL_OF_FAME_MODULE_IMPORTS = [
    CommunitySharedModule,
    MongooseModule.forFeature([{ name: CommunityHallOfFame.name, schema: CommunityHallOfFameSchema }]),
    ScheduleModule.forRoot(),
];

export const COMMUNITY_HALL_OF_FAME_MODULE_CONTROLLERS = [CommunityHallOfFameController];

export const COMMUNITY_HALL_OF_FAME_MODULE_PROVIDERS = [
    GetCurrentCommunityHallOfFameUseCase,
    GetCommunityHallOfFameHistoryUseCase,
    RefreshCommunityHallOfFameUseCase,
    CommunityHallOfFamePeriodService,
    CommunityHallOfFameMapperService,
    CommunityHallOfFameMongooseAdapter,
    CommunityHallOfFamePostReaderMongooseAdapter,
    CommunityHallOfFameScheduler,
    { provide: COMMUNITY_HALL_OF_FAME_PORT, useExisting: CommunityHallOfFameMongooseAdapter },
    { provide: COMMUNITY_HALL_OF_FAME_POST_READER_PORT, useExisting: CommunityHallOfFamePostReaderMongooseAdapter },
];
