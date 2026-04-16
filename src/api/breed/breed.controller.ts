import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../common/decorator/swagger.decorator';
import { PetType } from '../../common/enum/user.enum';

import { GetBreedsUseCase } from './application/use-cases/get-breeds.use-case';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreedsResponseDto } from './dto/response/get-breeds-response.dto';
import { BreedPetTypePipe } from './pipe/breed-pet-type.pipe';
import { BreedSwaggerDocs } from './swagger';

@ApiController('품종')
@Controller('breeds')
export class BreedController {
    constructor(private readonly getBreedsUseCase: GetBreedsUseCase) {}

    @Get(':petType')
    @ApiParam({
        name: 'petType',
        description: '조회할 동물 타입',
        enum: ['dog', 'cat'],
        example: 'dog',
    })
    @ApiEndpoint({
        ...BreedSwaggerDocs.getBreeds,
        responseType: GetBreedsResponseDto,
        isPublic: true,
    })
    async getBreeds(
        @Param('petType', BreedPetTypePipe) petType: PetType,
    ): Promise<ApiResponseDto<GetBreedsResponseDto>> {
        const result = await this.getBreedsUseCase.execute(petType);
        return ApiResponseDto.success(result);
    }
}
