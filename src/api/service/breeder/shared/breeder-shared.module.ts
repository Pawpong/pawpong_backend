import { Module } from '@nestjs/common';

import {
    BREEDER_SHARED_MODULE_EXPORTS,
    BREEDER_SHARED_MODULE_IMPORTS,
    BREEDER_SHARED_MODULE_PROVIDERS,
} from './breeder-shared.module-definition';

/**
 * 브리더 공개 조회 공통 슬라이스
 * - 브리더 공개 데이터 읽기 Port, 파일 URL 변환, 목록 페이지네이션
 */
@Module({
    imports: BREEDER_SHARED_MODULE_IMPORTS,
    providers: BREEDER_SHARED_MODULE_PROVIDERS,
    exports: BREEDER_SHARED_MODULE_EXPORTS,
})
export class BreederSharedModule {}
