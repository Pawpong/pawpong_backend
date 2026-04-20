import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from './constants/filter-options-response-messages';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { CatFurLengthOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetCatFurLengthsEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsCatFurLengthsController {
    constructor(private readonly getCatFurLengthsUseCase: GetCatFurLengthsUseCase) {}

    @Get('cat-fur-lengths')
    @ApiGetCatFurLengthsEndpoint()
    async getCatFurLengths(): Promise<ApiResponseDto<CatFurLengthOptionDto[]>> {
        const result = await this.getCatFurLengthsUseCase.execute();
        return ApiResponseDto.success(result, FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.catFurLengthsRetrieved);
    }
}
