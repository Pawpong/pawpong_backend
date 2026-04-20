import { Injectable } from '@nestjs/common';

import {
    FilterOptionsCatalogService,
    SortFilterOption,
} from '../../domain/services/filter-options-catalog.service';

@Injectable()
export class GetSortOptionsUseCase {
    constructor(private readonly filterOptionsCatalogService: FilterOptionsCatalogService) {}

    async execute(): Promise<SortFilterOption[]> {
        return this.filterOptionsCatalogService.getSortOptions();
    }
}
