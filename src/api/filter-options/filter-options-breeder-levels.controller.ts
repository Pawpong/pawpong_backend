import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreederLevelsUseCase } from './application/use-cases/get-breeder-levels.use-case';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { FilterOptionsBreederLevelResponseMessageService } from './domain/services/filter-options-breeder-level-response-message.service';
import { BreederLevelOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetBreederLevelsEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsBreederLevelsController {
    constructor(
        private readonly getBreederLevelsUseCase: GetBreederLevelsUseCase,
        private readonly filterOptionsBreederLevelResponseMessageService: FilterOptionsBreederLevelResponseMessageService,
    ) {}

    @Get('breeder-levels')
    @ApiGetBreederLevelsEndpoint()
    async getBreederLevels(): Promise<ApiResponseDto<BreederLevelOptionDto[]>> {
        const result = await this.getBreederLevelsUseCase.execute();
        return ApiResponseDto.success(
            result,
            this.filterOptionsBreederLevelResponseMessageService.breederLevelsRetrieved(),
        );
    }
}
