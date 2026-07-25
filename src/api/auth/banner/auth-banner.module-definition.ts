import { BreederManagementModule } from '../../breeder-management/breeder-management.module';
import { AuthBannerController } from '../controller/auth-banner.controller';

// 인증 > 로그인/가입 화면 배너 슬라이스
// 배너 데이터는 브리더 관리 컨텍스트가 소유하므로 GET_ACTIVE_PROFILE_BANNERS_QUERY Port 로만 소비한다.
export const AUTH_BANNER_MODULE_IMPORTS = [BreederManagementModule];

export const AUTH_BANNER_MODULE_CONTROLLERS = [AuthBannerController];
