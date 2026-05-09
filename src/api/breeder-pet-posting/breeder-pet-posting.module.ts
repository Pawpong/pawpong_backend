import { Module } from '@nestjs/common';

import {
    BREEDER_PET_POSTING_MODULE_CONTROLLERS,
    BREEDER_PET_POSTING_MODULE_IMPORTS,
    BREEDER_PET_POSTING_MODULE_PROVIDERS,
} from './breeder-pet-posting.module-definition';

/**
 * v2 분양글 작성 모듈.
 * /api/v2/breeder-pet-posting — 브리더 전용 (StrictRolesGuard).
 *
 * Figma 분양글 작성 화면(566:30126) 의 백엔드 진입점이다.
 * 추후 update/delete/list 는 본 모듈에 추가하거나 별도 v2 모듈로 분리한다.
 */
@Module({
    imports: BREEDER_PET_POSTING_MODULE_IMPORTS,
    controllers: BREEDER_PET_POSTING_MODULE_CONTROLLERS,
    providers: BREEDER_PET_POSTING_MODULE_PROVIDERS,
})
export class BreederPetPostingModule {}
