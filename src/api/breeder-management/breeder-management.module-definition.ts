import { BreederManagementSharedModule } from './shared/breeder-management-shared.module';
import { BreederManagementProfileModule } from './profile/breeder-management-profile.module';
import { BreederManagementVerificationModule } from './verification/breeder-management-verification.module';
import { BreederManagementPetsModule } from './pets/breeder-management-pets.module';
import { BreederManagementApplicationsModule } from './applications/breeder-management-applications.module';
import { BreederManagementReviewsModule } from './reviews/breeder-management-reviews.module';
import { BreederManagementAccountModule } from './account/breeder-management-account.module';
import { BreederManagementAdminBannerModule } from './admin/breeder-management-admin-banner.module';

// 브리더 관리 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 각 슬라이스가 자기 DI(컨트롤러·유스케이스·도메인·어댑터·Port 바인딩)를 직접 소유하고,
// 슬라이스 간 공유가 필요한 것만 Port 로 노출한다(shared: 코어 repo·FILE_URL·LIST_READER·SETTINGS,
// profile: PROFILE_PORT, admin-banner: GET_ACTIVE_PROFILE_BANNERS_QUERY).
export const BREEDER_MANAGEMENT_MODULE_IMPORTS = [
    BreederManagementSharedModule,
    BreederManagementProfileModule,
    BreederManagementVerificationModule,
    BreederManagementPetsModule,
    BreederManagementApplicationsModule,
    BreederManagementReviewsModule,
    BreederManagementAccountModule,
    BreederManagementAdminBannerModule,
];

// 외부 도메인(auth/notification 등)이 소비하는 것만 재노출
export const BREEDER_MANAGEMENT_MODULE_EXPORTS = [
    // 코어 repo(BreederRepository·AvailablePetManagementRepository 등)
    BreederManagementSharedModule,
    // 활성 프로필 배너 조회 Port (auth 배너 컨트롤러)
    BreederManagementAdminBannerModule,
];
