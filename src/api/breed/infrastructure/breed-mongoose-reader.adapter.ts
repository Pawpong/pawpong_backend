import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breed } from '../../../schema/breed.schema';
import { BreedReaderPort, BreedCategorySnapshot } from '../application/ports/breed-reader.port';

@Injectable()
export class BreedMongooseReaderAdapter implements BreedReaderPort {
    constructor(@InjectModel(Breed.name) private readonly breedModel: Model<Breed>) {}

    async readByPetType(petType: string): Promise<BreedCategorySnapshot[]> {
        const results = await this.breedModel.find({ petType }).exec();

        return results.map((result) => ({
            category: result.category,
            categoryDescription: result.categoryDescription,
            breeds: result.breeds,
        }));
    }
}
