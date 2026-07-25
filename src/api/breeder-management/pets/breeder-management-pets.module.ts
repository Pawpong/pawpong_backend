import { Module } from '@nestjs/common';

import {
    BREEDER_MANAGEMENT_PETS_MODULE_CONTROLLERS,
    BREEDER_MANAGEMENT_PETS_MODULE_IMPORTS,
    BREEDER_MANAGEMENT_PETS_MODULE_PROVIDERS,
} from './breeder-management-pets.module-definition';

/**
 * 브리더 관리 > 동물 슬라이스
 * - 부모 동물 등록/수정/삭제
 * - 분양 가능 동물 등록/수정/상태 변경/삭제, 내 동물 목록
 */
@Module({
    imports: BREEDER_MANAGEMENT_PETS_MODULE_IMPORTS,
    controllers: BREEDER_MANAGEMENT_PETS_MODULE_CONTROLLERS,
    providers: BREEDER_MANAGEMENT_PETS_MODULE_PROVIDERS,
})
export class BreederManagementPetsModule {}
