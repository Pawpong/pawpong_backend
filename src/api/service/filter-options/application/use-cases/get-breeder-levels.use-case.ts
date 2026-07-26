import { Injectable } from '@nestjs/common';

import {
    BreederLevelFilterOption,
    FilterOptionsCatalogService,
} from '../../domain/services/filter-options-catalog.service';

@Injectable()
export class GetBreederLevelsUseCase {
    constructor(private readonly filterOptionsCatalogService: FilterOptionsCatalogService) {}

    async execute(): Promise<BreederLevelFilterOption[]> {
        return this.filterOptionsCatalogService.getBreederLevels();
    }
}
