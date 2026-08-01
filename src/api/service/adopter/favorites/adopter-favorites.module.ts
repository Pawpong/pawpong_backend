import { Module } from '@nestjs/common';

import {
    ADOPTER_FAVORITES_MODULE_CONTROLLERS,
    ADOPTER_FAVORITES_MODULE_IMPORTS,
    ADOPTER_FAVORITES_MODULE_PROVIDERS,
} from './adopter-favorites.module-definition';

/**
 * 입양자 > 즐겨찾기 슬라이스
 * - 관심 브리더 추가/삭제/목록 조회
 */
@Module({
    imports: ADOPTER_FAVORITES_MODULE_IMPORTS,
    controllers: ADOPTER_FAVORITES_MODULE_CONTROLLERS,
    providers: ADOPTER_FAVORITES_MODULE_PROVIDERS,
})
export class AdopterFavoritesModule {}
