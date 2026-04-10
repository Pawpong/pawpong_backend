import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAllFilterOptionsUseCase } from './application/use-cases/get-all-filter-options.use-case';
import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from './constants/filter-options-response-messages';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { AllFilterOptionsResponseDto } from './dto/response/filter-options-response.dto';
import { ApiGetAllFilterOptionsEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsSummaryController {
    constructor(private readonly getAllFilterOptionsUseCase: GetAllFilterOptionsUseCase) {}

    @Get()
    @ApiGetAllFilterOptionsEndpoint()
    async getAllFilterOptions(): Promise<ApiResponseDto<AllFilterOptionsResponseDto>> {
        const result = await this.getAllFilterOptionsUseCase.execute();
        return ApiResponseDto.success(result, FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.allFilterOptionsRetrieved);
    }
}
