import { Injectable } from '@nestjs/common';

import {
    AdoptionStatusOptionDto,
    AllFilterOptionsResponseDto,
    BreederLevelOptionDto,
    CatFurLengthOptionDto,
    DogSizeOptionDto,
    SortOptionDto,
} from './dto/response/filter-options-response.dto';
import { GetAdoptionStatusUseCase } from './application/use-cases/get-adoption-status.use-case';
import { GetAllFilterOptionsUseCase } from './application/use-cases/get-all-filter-options.use-case';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { GetSortOptionsUseCase } from './application/use-cases/get-sort-options.use-case';

@Injectable()
export class FilterOptionsService {
    constructor(
        private readonly getAllFilterOptionsUseCase: GetAllFilterOptionsUseCase,
        private readonly getBreederLevelsUseCase: GetBreederLevelsUseCase,
        private readonly getSortOptionsUseCase: GetSortOptionsUseCase,
        private readonly getDogSizesUseCase: GetDogSizesUseCase,
        private readonly getCatFurLengthsUseCase: GetCatFurLengthsUseCase,
        private readonly getAdoptionStatusUseCase: GetAdoptionStatusUseCase,
    ) {}

    async getAllFilterOptions(): Promise<AllFilterOptionsResponseDto> {
        return this.getAllFilterOptionsUseCase.execute();
    }

    async getBreederLevels(): Promise<BreederLevelOptionDto[]> {
        return this.getBreederLevelsUseCase.execute();
    }

    async getSortOptions(): Promise<SortOptionDto[]> {
        return this.getSortOptionsUseCase.execute();
    }

    async getDogSizes(): Promise<DogSizeOptionDto[]> {
        return this.getDogSizesUseCase.execute();
    }

    async getCatFurLengths(): Promise<CatFurLengthOptionDto[]> {
        return this.getCatFurLengthsUseCase.execute();
    }

    async getAdoptionStatus(): Promise<AdoptionStatusOptionDto[]> {
        return this.getAdoptionStatusUseCase.execute();
    }
}
