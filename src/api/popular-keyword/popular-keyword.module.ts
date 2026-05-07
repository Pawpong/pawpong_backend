import { Module } from '@nestjs/common';

import {
    POPULAR_KEYWORD_MODULE_CONTROLLERS,
    POPULAR_KEYWORD_MODULE_IMPORTS,
    POPULAR_KEYWORD_MODULE_PROVIDERS,
} from './popular-keyword.module-definition';

/**
 * 인기 검색어 모듈
 * 홈 화면 인기 검색어 영역에 노출되는 큐레이션 키워드 CRUD 제공
 */
@Module({
    imports: POPULAR_KEYWORD_MODULE_IMPORTS,
    controllers: POPULAR_KEYWORD_MODULE_CONTROLLERS,
    providers: POPULAR_KEYWORD_MODULE_PROVIDERS,
})
export class PopularKeywordModule {}
