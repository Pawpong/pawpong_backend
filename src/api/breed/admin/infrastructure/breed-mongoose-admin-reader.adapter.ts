import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breed } from '../../../../schema/breed.schema';
import { BreedAdminReaderPort, BreedAdminSnapshot } from '../application/ports/breed-admin-reader.port';

@Injectable()
export class BreedMongooseAdminReaderAdapter implements BreedAdminReaderPort {
    constructor(@InjectModel(Breed.name) private readonly breedModel: Model<Breed>) {}

    async readAll(): Promise<BreedAdminSnapshot[]> {
        const breeds = await this.breedModel.find().sort({ petType: 1, category: 1 }).exec();
        return breeds.map((breed) => this.toSnapshot(breed));
    }

    async findById(id: string): Promise<BreedAdminSnapshot | null> {
        const breed = await this.breedModel.findById(id).exec();
        return breed ? this.toSnapshot(breed) : null;
    }

    async findByPetTypeAndCategory(
        petType: string,
        category: string,
        excludeId?: string,
    ): Promise<BreedAdminSnapshot | null> {
        const filter: Record<string, unknown> = { petType, category };
        if (excludeId) {
            filter._id = { $ne: excludeId };
        }

        const breed = await this.breedModel.findOne(filter).exec();
        return breed ? this.toSnapshot(breed) : null;
    }

    private toSnapshot(breed: any): BreedAdminSnapshot {
        return {
            id: breed._id.toString(),
            petType: breed.petType,
            category: breed.category,
            categoryDescription: breed.categoryDescription,
            breeds: breed.breeds,
            createdAt: breed.createdAt,
            updatedAt: breed.updatedAt,
        };
    }
}
