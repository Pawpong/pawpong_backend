import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetSortOptionsUseCase } from './application/use-cases/get-sort-options.use-case';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { FilterOptionsCatalogResponseMessageService } from './domain/services/filter-options-catalog-response-message.service';
import { SortOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetSortOptionsEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsSortOptionsController {
    constructor(
        private readonly getSortOptionsUseCase: GetSortOptionsUseCase,
        private readonly filterOptionsCatalogResponseMessageService: FilterOptionsCatalogResponseMessageService,
    ) {}

    @Get('sort-options')
    @ApiGetSortOptionsEndpoint()
    async getSortOptions(): Promise<ApiResponseDto<SortOptionDto[]>> {
        const result = await this.getSortOptionsUseCase.execute();
        return ApiResponseDto.success(result, this.filterOptionsCatalogResponseMessageService.sortOptionsRetrieved());
    }
}
