import { Injectable } from '@nestjs/common';

import {
    AllFilterOptionsSnapshot,
    FilterOptionsCatalogService,
} from '../../domain/services/filter-options-catalog.service';

@Injectable()
export class GetAllFilterOptionsUseCase {
    constructor(private readonly filterOptionsCatalogService: FilterOptionsCatalogService) {}

    async execute(): Promise<AllFilterOptionsSnapshot> {
        return this.filterOptionsCatalogService.getAll();
    }
}
