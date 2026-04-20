import { Injectable } from '@nestjs/common';

import {
    DogSizeFilterOption,
    FilterOptionsCatalogService,
} from '../../domain/services/filter-options-catalog.service';

@Injectable()
export class GetDogSizesUseCase {
    constructor(private readonly filterOptionsCatalogService: FilterOptionsCatalogService) {}

    async execute(): Promise<DogSizeFilterOption[]> {
        return this.filterOptionsCatalogService.getDogSizes();
    }
}
