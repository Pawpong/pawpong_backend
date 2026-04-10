import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetDogSizesUseCase } from './application/use-cases/get-dog-sizes.use-case';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { FilterOptionsDogSizeResponseMessageService } from './domain/services/filter-options-dog-size-response-message.service';
import { DogSizeOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetDogSizesEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsDogSizesController {
    constructor(
        private readonly getDogSizesUseCase: GetDogSizesUseCase,
        private readonly filterOptionsDogSizeResponseMessageService: FilterOptionsDogSizeResponseMessageService,
    ) {}

    @Get('dog-sizes')
    @ApiGetDogSizesEndpoint()
    async getDogSizes(): Promise<ApiResponseDto<DogSizeOptionDto[]>> {
        const result = await this.getDogSizesUseCase.execute();
        return ApiResponseDto.success(result, this.filterOptionsDogSizeResponseMessageService.dogSizesRetrieved());
    }
}
