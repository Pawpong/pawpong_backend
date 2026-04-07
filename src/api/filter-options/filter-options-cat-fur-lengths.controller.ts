import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetCatFurLengthsUseCase } from './application/use-cases/get-cat-fur-lengths.use-case';
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
        return ApiResponseDto.success(result, '고양이 털 길이 옵션이 조회되었습니다.');
    }
}
