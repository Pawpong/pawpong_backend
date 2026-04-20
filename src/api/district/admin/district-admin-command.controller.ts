import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateDistrictUseCase } from './application/use-cases/create-district.use-case';
import { DeleteDistrictUseCase } from './application/use-cases/delete-district.use-case';
import { UpdateDistrictUseCase } from './application/use-cases/update-district.use-case';
import type { DistrictAdminResult } from '../application/types/district-result.type';
import { DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES } from './constants/district-admin-response-messages';
import { DistrictAdminProtectedController } from './decorator/district-admin-controller.decorator';
import { CreateDistrictRequestDto } from './dto/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from './dto/request/update-district-request.dto';
import { DistrictResponseDto } from '../dto/response/district-response.dto';
import {
    ApiCreateDistrictAdminEndpoint,
    ApiDeleteDistrictAdminEndpoint,
    ApiUpdateDistrictAdminEndpoint,
} from './swagger';

@DistrictAdminProtectedController()
export class DistrictAdminCommandController {
    constructor(
        private readonly createDistrictUseCase: CreateDistrictUseCase,
        private readonly updateDistrictUseCase: UpdateDistrictUseCase,
        private readonly deleteDistrictUseCase: DeleteDistrictUseCase,
    ) {}

    @Post()
    @ApiCreateDistrictAdminEndpoint()
    async createDistrict(@Body() dto: CreateDistrictRequestDto): Promise<ApiResponseDto<DistrictResponseDto>> {
        const result = await this.createDistrictUseCase.execute(dto);
        return ApiResponseDto.success(result as DistrictResponseDto & DistrictAdminResult);
    }

    @Patch(':id')
    @ApiUpdateDistrictAdminEndpoint()
    async updateDistrict(
        @Param('id') id: string,
        @Body() dto: UpdateDistrictRequestDto,
    ): Promise<ApiResponseDto<DistrictResponseDto>> {
        const result = await this.updateDistrictUseCase.execute(id, dto);
        return ApiResponseDto.success(result as DistrictResponseDto & DistrictAdminResult);
    }

    @Delete(':id')
    @ApiDeleteDistrictAdminEndpoint()
    async deleteDistrict(@Param('id') id: string): Promise<ApiResponseDto<null>> {
        await this.deleteDistrictUseCase.execute(id);
        return ApiResponseDto.success(null, DISTRICT_ADMIN_RESPONSE_MESSAGE_EXAMPLES.districtDeleted);
    }
}
