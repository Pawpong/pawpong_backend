import { Get, Param } from '@nestjs/common';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetAllBreedsAdminUseCase } from './application/use-cases/get-all-breeds-admin.use-case';
import { GetBreedByIdUseCase } from './application/use-cases/get-breed-by-id.use-case';
import { BreedAdminControllerBase } from './decorator/breed-admin-controller.decorator';
import { BreedResponseDto } from '../dto/response/breed-response.dto';
import { ApiGetAllBreedsAdminEndpoint, ApiGetBreedByIdAdminEndpoint } from './swagger';

@BreedAdminControllerBase()
export class BreedAdminQueryController {
    constructor(
        private readonly getAllBreedsAdminUseCase: GetAllBreedsAdminUseCase,
        private readonly getBreedByIdUseCase: GetBreedByIdUseCase,
    ) {}

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
}
