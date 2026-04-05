import { Injectable } from '@nestjs/common';

import { SearchBreederRequestDto } from './dto/request/search-breeder-request.dto';
import { BreederCardResponseDto } from './dto/response/breeder-card-response.dto';
import { BreederExploreResponseDto } from './dto/response/breeder-explore-response.dto';
import { ExploreBreedersUseCase } from './application/use-cases/explore-breeders.use-case';
import { GetPopularBreedersUseCase } from './application/use-cases/get-popular-breeders.use-case';

@Injectable()
export class BreederExploreService {
    constructor(
        private readonly exploreBreedersUseCase: ExploreBreedersUseCase,
        private readonly getPopularBreedersUseCase: GetPopularBreedersUseCase,
    ) {}

    async searchBreeders(searchDto: SearchBreederRequestDto, userId?: string): Promise<BreederExploreResponseDto> {
        return this.exploreBreedersUseCase.execute(searchDto, userId);
    }

    async getPopularBreeders(limit: number = 10): Promise<BreederCardResponseDto[]> {
        return this.getPopularBreedersUseCase.execute(limit);
    }
}
