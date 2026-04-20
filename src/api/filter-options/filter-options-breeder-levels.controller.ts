import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from './constants/filter-options-response-messages';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { BreederLevelOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetBreederLevelsEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsBreederLevelsController {
    constructor(private readonly getBreederLevelsUseCase: GetBreederLevelsUseCase) {}

    @Get('breeder-levels')
    @ApiGetBreederLevelsEndpoint()
    async getBreederLevels(): Promise<ApiResponseDto<BreederLevelOptionDto[]>> {
        const result = await this.getBreederLevelsUseCase.execute();
        return ApiResponseDto.success(result, FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.breederLevelsRetrieved);
    }
}
