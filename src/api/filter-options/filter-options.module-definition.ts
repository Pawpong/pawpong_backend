import { GetAdoptionStatusUseCase } from './application/use-cases/get-adoption-status.use-case';
import { GetAllFilterOptionsUseCase } from './application/use-cases/get-all-filter-options.use-case';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { GetSortOptionsUseCase } from './application/use-cases/get-sort-options.use-case';
import { FilterOptionsAdoptionStatusController } from './controller/filter-options-adoption-status.controller';
import { FilterOptionsBreederLevelsController } from './controller/filter-options-breeder-levels.controller';
import { FilterOptionsCatFurLengthsController } from './controller/filter-options-cat-fur-lengths.controller';
import { FilterOptionsDogSizesController } from './controller/filter-options-dog-sizes.controller';
import { FilterOptionsSortOptionsController } from './controller/filter-options-sort-options.controller';
import { FilterOptionsSummaryController } from './controller/filter-options-summary.controller';
import { FilterOptionsCatalogService } from './domain/services/filter-options-catalog.service';

export const FILTER_OPTIONS_MODULE_CONTROLLERS = [
    FilterOptionsSummaryController,
    FilterOptionsBreederLevelsController,
    FilterOptionsSortOptionsController,
    FilterOptionsDogSizesController,
    FilterOptionsCatFurLengthsController,
    FilterOptionsAdoptionStatusController,
];

const FILTER_OPTIONS_USE_CASE_PROVIDERS = [
    GetAllFilterOptionsUseCase,
    GetBreederLevelsUseCase,
    GetSortOptionsUseCase,
    GetDogSizesUseCase,
    GetCatFurLengthsUseCase,
    GetAdoptionStatusUseCase,
];

const FILTER_OPTIONS_DOMAIN_PROVIDERS = [FilterOptionsCatalogService];

export const FILTER_OPTIONS_MODULE_PROVIDERS = [
    ...FILTER_OPTIONS_DOMAIN_PROVIDERS,
    ...FILTER_OPTIONS_USE_CASE_PROVIDERS,
];
