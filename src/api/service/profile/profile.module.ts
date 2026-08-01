import { Module } from '@nestjs/common';

import {
    PROFILE_MODULE_CONTROLLERS,
    PROFILE_MODULE_IMPORTS,
    PROFILE_MODULE_PROVIDERS,
} from './profile.module-definition';

/**
 * v2 profile 모듈.
 * /api/v2/profile/* — 본인 프로필 / 다른 입양자 프로필 / 브리더 공개 프로필 / 즐겨찾는 브리더 목록.
 */
@Module({
    imports: PROFILE_MODULE_IMPORTS,
    controllers: PROFILE_MODULE_CONTROLLERS,
    providers: PROFILE_MODULE_PROVIDERS,
})
export class ProfileModule {}
