import { Module } from '@nestjs/common';

import {
    BREEDER_DISCOVERY_MODULE_CONTROLLERS,
    BREEDER_DISCOVERY_MODULE_IMPORTS,
    BREEDER_DISCOVERY_MODULE_PROVIDERS,
} from './breeder-discovery.module-definition';

/**
 * 브리더 > 탐색 슬라이스
 * - 브리더 검색(필터·정렬), 탐색 목록, 인기 브리더
 */
@Module({
    imports: BREEDER_DISCOVERY_MODULE_IMPORTS,
    controllers: BREEDER_DISCOVERY_MODULE_CONTROLLERS,
    providers: BREEDER_DISCOVERY_MODULE_PROVIDERS,
})
export class BreederDiscoveryModule {}
