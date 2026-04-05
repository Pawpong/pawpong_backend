import { Inject, Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../common/dto/pagination/pagination-builder.dto';
import { BreederSearchRequestDto } from '../../dto/request/breeder-search-request.dto';
import { BreederSearchResponseDto } from '../../dto/response/breeder-search-response.dto';
import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederSearchCriteriaService } from '../../domain/services/breeder-search-criteria.service';
import { BreederSearchResultMapperService } from '../../domain/services/breeder-search-result-mapper.service';

@Injectable()
export class SearchBreedersUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederSearchCriteriaService: BreederSearchCriteriaService,
        private readonly breederSearchResultMapperService: BreederSearchResultMapperService,
    ) {}

    async execute(searchDto: BreederSearchRequestDto): Promise<BreederSearchResponseDto> {
        const page = searchDto.page || 1;
        const limit = searchDto.limit || 10;
        const { filter, sortOrder } = this.breederSearchCriteriaService.build(searchDto);

        const result = await this.breederPublicReaderPort.searchPublicBreeders(filter, sortOrder, page, limit);
        const items = result.breeders.map((breeder) =>
            this.breederSearchResultMapperService.toItem(breeder, this.breederFileUrlPort),
        );

        return new PaginationBuilder<any>()
            .setItems(items)
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(result.total)
            .build() as BreederSearchResponseDto;
    }
}
