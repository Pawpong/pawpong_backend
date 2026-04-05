import { Controller, Get } from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetDistrictsResponseDto } from './dto/response/get-districts-response.dto';
import { GetAllDistrictsUseCase } from './application/use-cases/get-all-districts.use-case';

@ApiController('지역 관리')
@Controller('districts')
export class DistrictController {
    constructor(private readonly getAllDistrictsUseCase: GetAllDistrictsUseCase) {}

    @Get()
    @ApiEndpoint({
        summary: '모든 지역 데이터 조회',
        description: '대한민국의 모든 지역(province와 cities) 데이터를 조회합니다.',
        responseType: GetDistrictsResponseDto,
        isPublic: true,
    })
    async getAllDistricts(): Promise<ApiResponseDto<GetDistrictsResponseDto[]>> {
        const result = await this.getAllDistrictsUseCase.execute();
        return ApiResponseDto.success(result);
    }
}
