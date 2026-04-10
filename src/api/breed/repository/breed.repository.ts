import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breed } from '../../../schema/breed.schema';
import { type CreateBreedCommand, type UpdateBreedCommand } from '../admin/application/types/breed-command.type';

@Injectable()
export class BreedRepository {
    constructor(@InjectModel(Breed.name) private readonly breedModel: Model<Breed>) {}

    findByPetType(petType: string): Promise<Breed[]> {
        return this.breedModel.find({ petType }).exec();
    }

    findAllSorted(): Promise<Breed[]> {
        return this.breedModel.find().sort({ petType: 1, category: 1 }).exec();
    }

    findById(id: string): Promise<Breed | null> {
        return this.breedModel.findById(id).exec();
    }

    findByPetTypeAndCategory(petType: string, category: string, excludeId?: string): Promise<Breed | null> {
        const filter: Record<string, unknown> = { petType, category };
        if (excludeId) {
            filter._id = { $ne: excludeId };
        }

        return this.breedModel.findOne(filter).exec();
    }

    async create(dto: CreateBreedCommand): Promise<Breed> {
        const breed = new this.breedModel(dto);
        return breed.save();
    }

    update(id: string, dto: UpdateBreedCommand): Promise<Breed | null> {
        return this.breedModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: false }).exec();
    }

    async deleteById(id: string): Promise<boolean> {
        const deleted = await this.breedModel.findByIdAndDelete(id).exec();
        return !!deleted;
    }
}
