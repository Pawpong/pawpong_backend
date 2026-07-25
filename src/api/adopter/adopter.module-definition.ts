import { AdopterSharedModule } from './shared/adopter-shared.module';
import { AdopterProfileModule } from './profile/adopter-profile.module';
import { AdopterFavoritesModule } from './favorites/adopter-favorites.module';
import { AdopterApplicationsModule } from './applications/adopter-applications.module';
import { AdopterReviewsModule } from './reviews/adopter-reviews.module';
import { AdopterAccountModule } from './account/adopter-account.module';
import { AdopterAdminModule } from './admin/adopter-admin.module';

// 입양자 바운디드 컨텍스트 — 기능 슬라이스 조립만 담당한다.
// 각 슬라이스가 자기 DI(컨트롤러·유스케이스·도메인·어댑터·Port 바인딩)를 직접 소유하고,
// 공유가 필요한 것만 shared 가 Port 로 노출한다(PROFILE / BREEDER_READER / FILE_URL / FAVORITE_READER).
export const ADOPTER_MODULE_IMPORTS = [
    AdopterSharedModule,
    AdopterProfileModule,
    AdopterFavoritesModule,
    AdopterApplicationsModule,
    AdopterReviewsModule,
    AdopterAccountModule,
    AdopterAdminModule,
];

// 외부 바운디드 컨텍스트(profile 등)가 소비하는 것만 재노출.
// - AdopterSharedModule: ADOPTER_FAVORITE_READER_PORT 등 — 입양자가 유일하게 소유하는
//   Adopter.favoriteBreederList 원본 데이터를 다른 도메인이 재쿼리하지 않고 읽을 수 있게 한다.
export const ADOPTER_MODULE_EXPORTS = [AdopterSharedModule];
