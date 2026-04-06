import { Injectable } from '@nestjs/common';
import { GetBreedsUseCase } from '../application/use-cases/get-breeds.use-case';

import { GetBreedsResponseDto } from '../dto/response/get-breeds-response.dto';

@Injectable()
export class BreedService {
    constructor(private readonly getBreedsUseCase: GetBreedsUseCase) {}

    /**
     * 특정 동물의 품종 목록 조회
     */
    async getBreeds(petType: string): Promise<GetBreedsResponseDto> {
        return this.getBreedsUseCase.execute(petType);
    }
}
