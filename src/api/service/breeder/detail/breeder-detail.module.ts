import { Module } from '@nestjs/common';

import {
    BREEDER_DETAIL_MODULE_CONTROLLERS,
    BREEDER_DETAIL_MODULE_IMPORTS,
    BREEDER_DETAIL_MODULE_PROVIDERS,
} from './breeder-detail.module-definition';

/**
 * 브리더 > 상세 슬라이스 (브리더홈)
 * - 공개 프로필, 입양 신청서 양식
 * - 보유 동물 목록·상세, 부모견 목록
 * - 받은 후기 목록
 */
@Module({
    imports: BREEDER_DETAIL_MODULE_IMPORTS,
    controllers: BREEDER_DETAIL_MODULE_CONTROLLERS,
    providers: BREEDER_DETAIL_MODULE_PROVIDERS,
})
export class BreederDetailModule {}
