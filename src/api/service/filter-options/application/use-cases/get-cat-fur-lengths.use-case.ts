import { Injectable } from '@nestjs/common';

import {
    CatFurLengthFilterOption,
    FilterOptionsCatalogService,
} from '../../domain/services/filter-options-catalog.service';

@Injectable()
export class GetCatFurLengthsUseCase {
    constructor(private readonly filterOptionsCatalogService: FilterOptionsCatalogService) {}

    async execute(): Promise<CatFurLengthFilterOption[]> {
        return this.filterOptionsCatalogService.getCatFurLengths();
    }
}
