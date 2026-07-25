import { AdopterSharedModule } from '../shared/adopter-shared.module';
import { AdopterFavoriteCommandController } from '../controller/adopter-favorite-command.controller';
import { AddFavoriteBreederUseCase } from '../application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from '../application/use-cases/remove-favorite-breeder.use-case';
import { AdopterFavoritePolicyService } from '../domain/services/adopter-favorite-policy.service';
import { AdopterFavoriteRecordMapperService } from '../domain/services/adopter-favorite-record-mapper.service';

// 입양자 > 즐겨찾기(관심 브리더) 슬라이스
// 조회(GET)는 이 도메인에 실사용 호출자가 없어 제거되었다 — 읽기 원본 데이터는
// ADOPTER_FAVORITE_READER_PORT(shared)로 노출되어 profile 도메인(GET /profile/me/favorite-breeders)이 사용한다.
export const ADOPTER_FAVORITES_MODULE_IMPORTS = [AdopterSharedModule];

export const ADOPTER_FAVORITES_MODULE_CONTROLLERS = [AdopterFavoriteCommandController];

export const ADOPTER_FAVORITES_MODULE_PROVIDERS = [
    AddFavoriteBreederUseCase,
    RemoveFavoriteBreederUseCase,
    AdopterFavoritePolicyService,
    AdopterFavoriteRecordMapperService,
];
