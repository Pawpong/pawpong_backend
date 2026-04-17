import { Controller, Get, Param } from '@nestjs/common';

import { PetType } from '../../common/enum/user.enum';
import { GetBreedsUseCase } from './application/use-cases/get-breeds.use-case';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { GetBreedsResponseDto } from './dto/response/get-breeds-response.dto';
import { BreedPetTypePipe } from './pipe/breed-pet-type.pipe';
import { ApiBreedController, ApiGetBreedsEndpoint } from './swagger';

@ApiBreedController()
@Controller('breeds')
export class BreedController {
    constructor(private readonly getBreedsUseCase: GetBreedsUseCase) {}

    @Get(':petType')
    @ApiGetBreedsEndpoint()
    async getBreeds(
        @Param('petType', BreedPetTypePipe) petType: PetType,
    ): Promise<ApiResponseDto<GetBreedsResponseDto>> {
        const result = await this.getBreedsUseCase.execute(petType);
        return ApiResponseDto.success(result);
    }
}
