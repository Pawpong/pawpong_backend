import { AdopterSharedModule } from '../shared/adopter-shared.module';
import { AdopterFavoriteCommandController } from '../controller/adopter-favorite-command.controller';
import { AdopterFavoriteQueryController } from '../controller/adopter-favorite-query.controller';
import { AddFavoriteBreederUseCase } from '../application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from '../application/use-cases/remove-favorite-breeder.use-case';
import { GetFavoriteBreedersUseCase } from '../application/use-cases/get-favorite-breeders.use-case';
import { AdopterFavoritePolicyService } from '../domain/services/adopter-favorite-policy.service';
import { AdopterFavoriteDetailMapperService } from '../domain/services/adopter-favorite-detail-mapper.service';
import { AdopterFavoriteRecordMapperService } from '../domain/services/adopter-favorite-record-mapper.service';

// 입양자 > 즐겨찾기(관심 브리더) 슬라이스
export const ADOPTER_FAVORITES_MODULE_IMPORTS = [AdopterSharedModule];

export const ADOPTER_FAVORITES_MODULE_CONTROLLERS = [
    AdopterFavoriteCommandController,
    AdopterFavoriteQueryController,
];

export const ADOPTER_FAVORITES_MODULE_PROVIDERS = [
    AddFavoriteBreederUseCase,
    RemoveFavoriteBreederUseCase,
    GetFavoriteBreedersUseCase,
    AdopterFavoritePolicyService,
    AdopterFavoriteDetailMapperService,
    AdopterFavoriteRecordMapperService,
];
