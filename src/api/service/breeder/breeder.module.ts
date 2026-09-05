import { Module } from '@nestjs/common';
import { BREEDER_MODULE_IMPORTS } from './breeder.module-definition';

/**
 * 브리더(공개) 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/discovery/detail) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: BREEDER_MODULE_IMPORTS,
})
export class BreederModule {}
