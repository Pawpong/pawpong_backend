import { Module } from '@nestjs/common';

import {
    COMMUNITY_HALL_OF_FAME_MODULE_CONTROLLERS,
    COMMUNITY_HALL_OF_FAME_MODULE_IMPORTS,
    COMMUNITY_HALL_OF_FAME_MODULE_PROVIDERS,
} from './community-hall-of-fame.module-definition';

@Module({
    imports: COMMUNITY_HALL_OF_FAME_MODULE_IMPORTS,
    controllers: COMMUNITY_HALL_OF_FAME_MODULE_CONTROLLERS,
    providers: COMMUNITY_HALL_OF_FAME_MODULE_PROVIDERS,
})
export class CommunityHallOfFameModule {}
