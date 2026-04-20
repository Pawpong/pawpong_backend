import { Injectable } from '@nestjs/common';

import {
    AdoptionStatusFilterOption,
    FilterOptionsCatalogService,
} from '../../domain/services/filter-options-catalog.service';

@Injectable()
export class GetAdoptionStatusUseCase {
    constructor(private readonly filterOptionsCatalogService: FilterOptionsCatalogService) {}

    async execute(): Promise<AdoptionStatusFilterOption[]> {
        return this.filterOptionsCatalogService.getAdoptionStatus();
    }
}
