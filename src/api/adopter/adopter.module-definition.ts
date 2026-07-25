import { AdopterSharedModule } from './shared/adopter-shared.module';
import { AdopterProfileModule } from './profile/adopter-profile.module';
import { AdopterFavoritesModule } from './favorites/adopter-favorites.module';
import { AdopterApplicationsModule } from './applications/adopter-applications.module';
import { AdopterReviewsModule } from './reviews/adopter-reviews.module';
import { AdopterAccountModule } from './account/adopter-account.module';
import { AdopterAdminModule } from './admin/adopter-admin.module';

// 입양자 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 각 슬라이스가 자기 DI(컨트롤러·유스케이스·도메인·어댑터·Port 바인딩)를 직접 소유하고,
// 공유가 필요한 것만 shared 가 Port 로 노출한다(PROFILE / BREEDER_READER / FILE_URL).
export const ADOPTER_MODULE_IMPORTS = [
    AdopterSharedModule,
    AdopterProfileModule,
    AdopterFavoritesModule,
    AdopterApplicationsModule,
    AdopterReviewsModule,
    AdopterAccountModule,
    AdopterAdminModule,
];
