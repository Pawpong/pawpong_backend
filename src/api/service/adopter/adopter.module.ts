import { Module } from '@nestjs/common';
import { ADOPTER_MODULE_EXPORTS, ADOPTER_MODULE_IMPORTS } from './adopter.module-definition';

/**
 * 입양자 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/profile/favorites/applications/reviews/account/admin) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 * - 다른 바운디드 컨텍스트(profile 등)가 소비할 수 있도록 shared 슬라이스만 재노출한다
 */
@Module({
    imports: ADOPTER_MODULE_IMPORTS,
    exports: ADOPTER_MODULE_EXPORTS,
})
export class AdopterModule {}
