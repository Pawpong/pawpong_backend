import { BreederSharedModule } from '../shared/breeder-shared.module';
import { BreederDiscoveryController, BreederExploreController } from '../controller/breeder-discovery.controller';
import { SearchBreedersUseCase } from '../application/use-cases/search-breeders.use-case';
import { ExploreBreedersUseCase } from '../application/use-cases/explore-breeders.use-case';
import { GetPopularBreedersUseCase } from '../application/use-cases/get-popular-breeders.use-case';
import { BreederSearchCriteriaService } from '../domain/services/breeder-search-criteria.service';
import { BreederSearchResultMapperService } from '../domain/services/breeder-search-result-mapper.service';
import { BreederExploreCriteriaService } from '../domain/services/breeder-explore-criteria.service';
import { BreederExploreCardMapperService } from '../domain/services/breeder-explore-card-mapper.service';
import { BreederExploreFavoriteReaderService } from '../domain/services/breeder-explore-favorite-reader.service';

// 브리더 > 탐색 슬라이스 (검색 · 탐색 목록 · 인기 브리더)
export const BREEDER_DISCOVERY_MODULE_IMPORTS = [BreederSharedModule];

export const BREEDER_DISCOVERY_MODULE_CONTROLLERS = [BreederDiscoveryController, BreederExploreController];

export const BREEDER_DISCOVERY_MODULE_PROVIDERS = [
    SearchBreedersUseCase,
    ExploreBreedersUseCase,
    GetPopularBreedersUseCase,
    BreederSearchCriteriaService,
    BreederSearchResultMapperService,
    BreederExploreCriteriaService,
    BreederExploreCardMapperService,
    BreederExploreFavoriteReaderService,
];
