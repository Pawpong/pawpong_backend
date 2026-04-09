import { Inject, Injectable } from '@nestjs/common';

import { BreederSearchRequestDto } from '../../dto/request/breeder-search-request.dto';
import { BreederSearchResponseDto } from '../../dto/response/breeder-search-response.dto';
import { BREEDER_FILE_URL_PORT } from '../ports/breeder-file-url.port';
import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederFileUrlPort } from '../ports/breeder-file-url.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederSearchCriteriaService } from '../../domain/services/breeder-search-criteria.service';
import { BreederSearchResultMapperService } from '../../domain/services/breeder-search-result-mapper.service';
import { BreederPaginationAssemblerService } from '../../domain/services/breeder-pagination-assembler.service';

@Injectable()
export class SearchBreedersUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        @Inject(BREEDER_FILE_URL_PORT)
        private readonly breederFileUrlPort: BreederFileUrlPort,
        private readonly breederSearchCriteriaService: BreederSearchCriteriaService,
        private readonly breederSearchResultMapperService: BreederSearchResultMapperService,
        private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService,
    ) {}

    async execute(searchDto: BreederSearchRequestDto): Promise<BreederSearchResponseDto> {
        const page = searchDto.page || 1;
        const limit = searchDto.limit || 10;
        const { filter, sortOrder } = this.breederSearchCriteriaService.build(searchDto);

        const result = await this.breederPublicReaderPort.searchPublicBreeders(filter, sortOrder, page, limit);
        const items = result.breeders.map((breeder) =>
            this.breederSearchResultMapperService.toItem(breeder, this.breederFileUrlPort),
        );

        return new BreederSearchResponseDto(
            this.breederPaginationAssemblerService.createBuilder(items, page, limit, result.total),
        );
    }
}
