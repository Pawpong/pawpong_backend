import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Breed } from '../../../../schema/breed.schema';
import { CreateBreedRequestDto } from '../dto/request/create-breed-request.dto';
import { UpdateBreedRequestDto } from '../dto/request/update-breed-request.dto';
import { BreedAdminSnapshot } from '../application/ports/breed-admin-reader.port';
import { BreedWriterPort } from '../application/ports/breed-writer.port';

@Injectable()
export class BreedMongooseWriterAdapter implements BreedWriterPort {
    constructor(@InjectModel(Breed.name) private readonly breedModel: Model<Breed>) {}

    async create(dto: CreateBreedRequestDto): Promise<BreedAdminSnapshot> {
        const breed = new this.breedModel(dto);
        const saved = await breed.save();
        return this.toSnapshot(saved);
    }

    async update(id: string, dto: UpdateBreedRequestDto): Promise<BreedAdminSnapshot | null> {
        const updated = await this.breedModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: false })
            .exec();

        return updated ? this.toSnapshot(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await this.breedModel.findByIdAndDelete(id).exec();
        return !!deleted;
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
