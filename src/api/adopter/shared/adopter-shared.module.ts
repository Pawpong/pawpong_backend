import { Module } from '@nestjs/common';

import {
    ADOPTER_SHARED_MODULE_EXPORTS,
    ADOPTER_SHARED_MODULE_IMPORTS,
    ADOPTER_SHARED_MODULE_PROVIDERS,
} from './adopter-shared.module-definition';

/**
 * 입양자 공통 슬라이스
 * - 입양자 영속성(프로필·즐겨찾기), 본인 확인/브리더 조회/파일 URL Port
 * - 목록 페이지네이션 조립 서비스
 */
@Module({
    imports: ADOPTER_SHARED_MODULE_IMPORTS,
    providers: ADOPTER_SHARED_MODULE_PROVIDERS,
    exports: ADOPTER_SHARED_MODULE_EXPORTS,
})
export class AdopterSharedModule {}
