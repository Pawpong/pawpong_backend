import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetAdoptionStatusUseCase } from './application/use-cases/get-adoption-status.use-case';
import { FilterOptionsController } from './decorator/filter-options-controller.decorator';
import { AdoptionStatusOptionDto } from './dto/response/filter-options-response.dto';
import { ApiGetAdoptionStatusEndpoint } from './swagger';

@FilterOptionsController()
export class FilterOptionsAdoptionStatusController {
    constructor(private readonly getAdoptionStatusUseCase: GetAdoptionStatusUseCase) {}

    @Get('adoption-status')
    @ApiGetAdoptionStatusEndpoint()
    async getAdoptionStatus(): Promise<ApiResponseDto<AdoptionStatusOptionDto[]>> {
        const result = await this.getAdoptionStatusUseCase.execute();
        return ApiResponseDto.success(result, '입양 가능 여부 옵션이 조회되었습니다.');
    }
}
