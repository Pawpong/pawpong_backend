import { Get } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetDistrictsResponseDto } from './dto/response/get-districts-response.dto';
import { GetAllDistrictsUseCase } from './application/use-cases/get-all-districts.use-case';
import { DistrictPublicController } from './decorator/district-controller.decorator';
import { ApiGetAllDistrictsEndpoint } from './swagger';

@DistrictPublicController()
export class DistrictController {
    constructor(private readonly getAllDistrictsUseCase: GetAllDistrictsUseCase) {}

    @Get()
    @ApiGetAllDistrictsEndpoint()
    async getAllDistricts(): Promise<ApiResponseDto<GetDistrictsResponseDto[]>> {
        const result = await this.getAllDistrictsUseCase.execute();
        return ApiResponseDto.success(result);
    }
}
