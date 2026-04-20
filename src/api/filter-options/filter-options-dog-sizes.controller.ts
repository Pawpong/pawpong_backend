import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES } from './constants/filter-options-response-messages';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { DogSizeOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetDogSizesEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsDogSizesController {
    constructor(private readonly getDogSizesUseCase: GetDogSizesUseCase) {}

    @Get('dog-sizes')
    @ApiGetDogSizesEndpoint()
    async getDogSizes(): Promise<ApiResponseDto<DogSizeOptionDto[]>> {
        const result = await this.getDogSizesUseCase.execute();
        return ApiResponseDto.success(result, FILTER_OPTIONS_RESPONSE_MESSAGE_EXAMPLES.dogSizesRetrieved);
    }
}
