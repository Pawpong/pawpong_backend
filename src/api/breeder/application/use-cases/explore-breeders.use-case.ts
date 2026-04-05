import { Inject, Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { SearchBreederRequestDto } from '../../dto/request/search-breeder-request.dto';
import { BreederExploreResponseDto } from '../../dto/response/breeder-explore-response.dto';
import { BreederCardResponseDto } from '../../dto/response/breeder-card-response.dto';
import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederExploreCriteriaService } from '../../domain/services/breeder-explore-criteria.service';
import { BreederExploreFavoriteReaderService } from '../../domain/services/breeder-explore-favorite-reader.service';
import { BreederExploreCardMapperService } from '../../domain/services/breeder-explore-card-mapper.service';

@Injectable()
export class ExploreBreedersUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederExploreCriteriaService: BreederExploreCriteriaService,
        private readonly breederExploreFavoriteReaderService: BreederExploreFavoriteReaderService,
        private readonly breederExploreCardMapperService: BreederExploreCardMapperService,
    ) {}

    async execute(searchDto: SearchBreederRequestDto, userId?: string): Promise<BreederExploreResponseDto> {
        const { filter, sortOrder, page, limit, isAdoptionAvailable } = this.breederExploreCriteriaService.build(searchDto);
        const availableBreederIds = await this.breederPublicReaderPort.findBreederIdsWithAvailablePets();
        const availableBreederIdSet = new Set(availableBreederIds);

        if (isAdoptionAvailable === true) {
            filter['_id'] = { $in: availableBreederIds };
        }

        const [{ breeders, total }, favoritedBreederIds] = await Promise.all([
            this.breederPublicReaderPort.searchPublicBreeders(filter, sortOrder, page, limit),
            this.breederExploreFavoriteReaderService.readFavoriteBreederIds(userId, this.breederPublicReaderPort),
        ]);

        const favoritedBreederIdSet = new Set(favoritedBreederIds);
        const items = breeders.map((breeder) =>
            this.breederExploreCardMapperService.toExploreCard(
                breeder,
                this.breederFileUrlPort,
                availableBreederIdSet,
                favoritedBreederIdSet,
            ),
        );

        return new PaginationBuilder<BreederCardResponseDto>()
            .setItems(items)
            .setTotalCount(total)
            .setPage(page)
            .setLimit(limit)
            .build() as BreederExploreResponseDto;
    }
}
