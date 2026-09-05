import { BreederSharedModule } from './shared/breeder-shared.module';
import { BreederDiscoveryModule } from './discovery/breeder-discovery.module';
import { BreederDetailModule } from './detail/breeder-detail.module';

// 브리더(공개) 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 관리자 기능은 admin/ 하위의 별도 모듈(계정·인증심사·신고)이 소유한다.
export const BREEDER_MODULE_IMPORTS = [BreederSharedModule, BreederDiscoveryModule, BreederDetailModule];
