import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../../common/guard/jwt-auth.guard';
import { Roles } from '../../../common/decorator/roles.decorator';
import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';

import { CreateDistrictRequestDto } from '../../breeder-management/request/create-district-request.dto';
import { UpdateDistrictRequestDto } from '../../breeder-management/request/update-district-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { DistrictResponseDto } from '../dto/response/district-response.dto';
import { CreateDistrictUseCase } from './application/use-cases/create-district.use-case';
import { GetAllDistrictsAdminUseCase } from './application/use-cases/get-all-districts-admin.use-case';
import { GetDistrictByIdAdminUseCase } from './application/use-cases/get-district-by-id-admin.use-case';
import { UpdateDistrictUseCase } from './application/use-cases/update-district.use-case';
import { DeleteDistrictUseCase } from './application/use-cases/delete-district.use-case';

@ApiController('지역 관리 (Admin)')
@Controller('districts-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DistrictAdminController {
    constructor(
        private readonly createDistrictUseCase: CreateDistrictUseCase,
        private readonly getAllDistrictsAdminUseCase: GetAllDistrictsAdminUseCase,
        private readonly getDistrictByIdAdminUseCase: GetDistrictByIdAdminUseCase,
        private readonly updateDistrictUseCase: UpdateDistrictUseCase,
        private readonly deleteDistrictUseCase: DeleteDistrictUseCase,
    ) {}

    @Post()
    @ApiEndpoint({
        summary: '지역 생성',
        description: '새로운 지역을 생성합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
    })
    async createDistrict(@Body() dto: CreateDistrictRequestDto): Promise<ApiResponseDto<DistrictResponseDto>> {
        const result = await this.createDistrictUseCase.execute(dto);
        return ApiResponseDto.success(result);
    }

    @Get()
    @ApiEndpoint({
        summary: '모든 지역 조회',
        description: '모든 지역을 조회합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
    })
    async getAllDistricts(): Promise<ApiResponseDto<DistrictResponseDto[]>> {
        const result = await this.getAllDistrictsAdminUseCase.execute();
        return ApiResponseDto.success(result);
    }

    @Get(':id')
    @ApiEndpoint({
        summary: '특정 지역 조회',
        description: 'ID로 특정 지역을 조회합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
    })
    async getDistrictById(@Param('id') id: string): Promise<ApiResponseDto<DistrictResponseDto>> {
        const result = await this.getDistrictByIdAdminUseCase.execute(id);
        return ApiResponseDto.success(result);
    }

    @Patch(':id')
    @ApiEndpoint({
        summary: '지역 수정',
        description: '기존 지역을 수정합니다. (관리자 전용)',
        responseType: DistrictResponseDto,
    })
    async updateDistrict(
        @Param('id') id: string,
        @Body() dto: UpdateDistrictRequestDto,
    ): Promise<ApiResponseDto<DistrictResponseDto>> {
        const result = await this.updateDistrictUseCase.execute(id, dto);
        return ApiResponseDto.success(result);
    }

    @Delete(':id')
    @ApiEndpoint({
        summary: '지역 삭제',
        description: '기존 지역을 삭제합니다. (관리자 전용)',
    })
    async deleteDistrict(@Param('id') id: string): Promise<ApiResponseDto<null>> {
        await this.deleteDistrictUseCase.execute(id);
        return ApiResponseDto.success(null, '지역이 삭제되었습니다.');
    }
}
