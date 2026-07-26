import { Injectable } from '@nestjs/common';

import { BreedCategorySnapshot } from '../../application/ports/breed-reader.port';

@Injectable()
export class BreedCatalogService {
    buildResponse(petType: string, categories: BreedCategorySnapshot[]) {
        const categoryResults = categories.map((category) => ({
            category: category.category,
            categoryDescription: category.categoryDescription,
            breeds: category.breeds,
        }));

        return {
            petType,
            categories: categoryResults,
        };
    }
}
