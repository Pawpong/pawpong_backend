import { Controller, Get, Param, BadRequestException } from '@nestjs/common';

import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';

import { GetBreedsUseCase } from '../application/use-cases/get-breeds.use-case';

import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { GetBreedsResponseDto } from '../dto/response/get-breeds-response.dto';
import { BreedServiceSwaggerDocs } from './swagger';

@ApiController('품종')
@Controller('breeds')
export class BreedController {
    constructor(private readonly getBreedsUseCase: GetBreedsUseCase) {}

    @Get(':petType')
    @ApiEndpoint({
        ...BreedServiceSwaggerDocs.getBreeds,
        responseType: GetBreedsResponseDto,
        isPublic: true,
    })
    async getBreeds(@Param('petType') petType: string): Promise<ApiResponseDto<GetBreedsResponseDto>> {
        if (petType !== 'dog' && petType !== 'cat') {
            throw new BadRequestException('petType은 dog 또는 cat이어야 합니다.');
        }

        const result = await this.getBreedsUseCase.execute(petType);
        return ApiResponseDto.success(result);
    }
}
