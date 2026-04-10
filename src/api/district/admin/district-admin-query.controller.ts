import { Get, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllDistrictsAdminUseCase } from './application/use-cases/get-all-districts-admin.use-case';
import { GetDistrictByIdAdminUseCase } from './application/use-cases/get-district-by-id-admin.use-case';
import type { DistrictAdminResult } from '../application/types/district-result.type';
import { DistrictAdminProtectedController } from './decorator/district-admin-controller.decorator';
import { DistrictResponseDto } from '../dto/response/district-response.dto';
import { ApiGetAllDistrictsAdminEndpoint, ApiGetDistrictByIdAdminEndpoint } from './swagger';

@DistrictAdminProtectedController()
export class DistrictAdminQueryController {
    constructor(
        private readonly getAllDistrictsAdminUseCase: GetAllDistrictsAdminUseCase,
        private readonly getDistrictByIdAdminUseCase: GetDistrictByIdAdminUseCase,
    ) {}

    @Get()
    @ApiGetAllDistrictsAdminEndpoint()
    async getAllDistricts(): Promise<ApiResponseDto<DistrictResponseDto[]>> {
        const result = await this.getAllDistrictsAdminUseCase.execute();
        return ApiResponseDto.success(result as DistrictResponseDto[] & DistrictAdminResult[]);
    }

    @Get(':id')
    @ApiGetDistrictByIdAdminEndpoint()
    async getDistrictById(@Param('id') id: string): Promise<ApiResponseDto<DistrictResponseDto>> {
        const result = await this.getDistrictByIdAdminUseCase.execute(id);
        return ApiResponseDto.success(result as DistrictResponseDto & DistrictAdminResult);
    }
}
