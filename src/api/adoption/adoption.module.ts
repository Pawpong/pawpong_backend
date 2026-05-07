import { Module } from '@nestjs/common';

import {
    ADOPTION_MODULE_CONTROLLERS,
    ADOPTION_MODULE_IMPORTS,
    ADOPTION_MODULE_PROVIDERS,
} from './adoption.module-definition';

/**
 * 입양 페이지 모듈 (v2)
 * /v2/adoption 라우트 — 입양 가능 동물 목록 + 인기 동물 + 동물 단위 관심 토글
 */
@Module({
    imports: ADOPTION_MODULE_IMPORTS,
    controllers: ADOPTION_MODULE_CONTROLLERS,
    providers: ADOPTION_MODULE_PROVIDERS,
})
export class AdoptionModule {}
