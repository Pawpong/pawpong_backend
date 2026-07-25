import { Module } from '@nestjs/common';
import { ADOPTER_MODULE_IMPORTS } from './adopter.module-definition';

/**
 * 입양자 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/profile/favorites/applications/reviews/account/admin) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: ADOPTER_MODULE_IMPORTS,
})
export class AdopterModule {}
