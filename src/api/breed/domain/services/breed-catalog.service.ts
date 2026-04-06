import { Injectable } from '@nestjs/common';

import { BreedCategorySnapshot } from '../../application/ports/breed-reader.port';
import { BreedCategoryDto, GetBreedsResponseDto } from '../../dto/response/get-breeds-response.dto';

@Injectable()
export class BreedCatalogService {
    buildResponse(petType: string, categories: BreedCategorySnapshot[]): GetBreedsResponseDto {
        const categoryDtos: BreedCategoryDto[] = categories.map((category) => ({
            category: category.category,
            categoryDescription: category.categoryDescription,
            breeds: category.breeds,
        }));

        return new GetBreedsResponseDto(petType, categoryDtos);
    }
}
