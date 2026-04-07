import { Module } from '@nestjs/common';

import { GetAdoptionStatusUseCase } from './application/use-cases/get-adoption-status.use-case';
import { GetAllFilterOptionsUseCase } from './application/use-cases/get-all-filter-options.use-case';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { GetSortOptionsUseCase } from './application/use-cases/get-sort-options.use-case';
import { FilterOptionsSummaryController } from './filter-options-summary.controller';
import { FilterOptionsValuesController } from './filter-options-values.controller';
import { FilterOptionsService } from './filter-options.service';
import { FilterOptionsCatalogService } from './domain/services/filter-options-catalog.service';

@Module({
    controllers: [FilterOptionsSummaryController, FilterOptionsValuesController],
    providers: [
        FilterOptionsCatalogService,
        GetAllFilterOptionsUseCase,
        GetBreederLevelsUseCase,
        GetSortOptionsUseCase,
        GetDogSizesUseCase,
        GetCatFurLengthsUseCase,
        GetAdoptionStatusUseCase,
        FilterOptionsService,
    ],
    exports: [FilterOptionsService],
})
export class FilterOptionsModule {}
