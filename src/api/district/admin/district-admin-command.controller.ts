import { Body, Delete, Param, Patch, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { CreateDistrictUseCase } from './application/use-cases/create-district.use-case';
import { DeleteDistrictUseCase } from './application/use-cases/delete-district.use-case';
import { UpdateDistrictUseCase } from './application/use-cases/update-district.use-case';
import type { DistrictAdminResult } from '../application/types/district-result.type';
import { DistrictAdminProtectedController } from './decorator/district-admin-controller.decorator';
import { DistrictAdminResponseMessageService } from './domain/services/district-admin-response-message.service';
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
        private readonly districtAdminResponseMessageService: DistrictAdminResponseMessageService,
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
        return ApiResponseDto.success(null, this.districtAdminResponseMessageService.districtDeleted());
    }
}
