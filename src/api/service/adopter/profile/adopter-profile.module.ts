import { Module } from '@nestjs/common';

import {
    ADOPTER_PROFILE_MODULE_CONTROLLERS,
    ADOPTER_PROFILE_MODULE_IMPORTS,
    ADOPTER_PROFILE_MODULE_PROVIDERS,
} from './adopter-profile.module-definition';

/**
 * 입양자 > 프로필 슬라이스
 * - 내 프로필 조회 및 수정
 */
@Module({
    imports: ADOPTER_PROFILE_MODULE_IMPORTS,
    controllers: ADOPTER_PROFILE_MODULE_CONTROLLERS,
    providers: ADOPTER_PROFILE_MODULE_PROVIDERS,
})
export class AdopterProfileModule {}
