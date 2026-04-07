import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';

import { CreateBreedRequestDto } from './dto/request/create-breed-request.dto';
import { UpdateBreedRequestDto } from './dto/request/update-breed-request.dto';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { BreedResponseDto } from '../dto/response/breed-response.dto';
import { CreateBreedUseCase } from './application/use-cases/create-breed.use-case';
import { DeleteBreedUseCase } from './application/use-cases/delete-breed.use-case';
import { GetAllBreedsAdminUseCase } from './application/use-cases/get-all-breeds-admin.use-case';
import { GetBreedByIdUseCase } from './application/use-cases/get-breed-by-id.use-case';
import { UpdateBreedUseCase } from './application/use-cases/update-breed.use-case';
import {
    ApiBreedAdminController,
    ApiCreateBreedAdminEndpoint,
    ApiDeleteBreedAdminEndpoint,
    ApiGetAllBreedsAdminEndpoint,
    ApiGetBreedByIdAdminEndpoint,
    ApiUpdateBreedAdminEndpoint,
} from './swagger';

@ApiBreedAdminController()
@Controller('breeds-admin')
export class AdminBreedController {
    constructor(
        private readonly createBreedUseCase: CreateBreedUseCase,
        private readonly getAllBreedsAdminUseCase: GetAllBreedsAdminUseCase,
        private readonly getBreedByIdUseCase: GetBreedByIdUseCase,
        private readonly updateBreedUseCase: UpdateBreedUseCase,
        private readonly deleteBreedUseCase: DeleteBreedUseCase,
    ) {}

    @Post()
    @ApiCreateBreedAdminEndpoint()
    async createBreed(@Body() dto: CreateBreedRequestDto): Promise<ApiResponseDto<BreedResponseDto>> {
        const result = await this.createBreedUseCase.execute(dto);
        return ApiResponseDto.success(result);
    }

    @Get()
    @ApiGetAllBreedsAdminEndpoint()
    async getAllBreeds(): Promise<ApiResponseDto<BreedResponseDto[]>> {
        const result = await this.getAllBreedsAdminUseCase.execute();
        return ApiResponseDto.success(result);
    }

    @Get(':id')
    @ApiGetBreedByIdAdminEndpoint()
    async getBreedById(@Param('id') id: string): Promise<ApiResponseDto<BreedResponseDto>> {
        const result = await this.getBreedByIdUseCase.execute(id);
        return ApiResponseDto.success(result);
    }

    @Patch(':id')
    @ApiUpdateBreedAdminEndpoint()
    async updateBreed(
        @Param('id') id: string,
        @Body() dto: UpdateBreedRequestDto,
    ): Promise<ApiResponseDto<BreedResponseDto>> {
        const result = await this.updateBreedUseCase.execute(id, dto);
        return ApiResponseDto.success(result);
    }

    @Delete(':id')
    @ApiDeleteBreedAdminEndpoint()
    async deleteBreed(@Param('id') id: string): Promise<ApiResponseDto<null>> {
        await this.deleteBreedUseCase.execute(id);
        return ApiResponseDto.success(null, '품종 카테고리가 삭제되었습니다.');
    }
}
