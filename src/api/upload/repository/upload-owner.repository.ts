import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { ParentPet, ParentPetDocument } from '../../../schema/parent-pet.schema';

@Injectable()
export class UploadOwnerRepository {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
    ) {}

    private toObjectIdOrNull(value: string): Types.ObjectId | null {
        return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
    }

    async updateRepresentativePhotos(breederId: string, photoPaths: string[]): Promise<void> {
        await this.breederModel.findByIdAndUpdate(breederId, {
            $set: { 'profile.representativePhotos': photoPaths },
        });
    }

    findAvailablePetByIdAndBreeder(petId: string, breederId: string): Promise<AvailablePetDocument | null> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return Promise.resolve(null);
        }

        return this.availablePetModel.findOne({ _id: petObjectId, breederId: breederObjectId }).exec();
    }

    async updateAvailablePetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return;
        }

        await this.availablePetModel.findOneAndUpdate(
            { _id: petObjectId, breederId: breederObjectId },
            { $set: { photos: photoPaths } },
        );
    }

    findParentPetByIdAndBreeder(petId: string, breederId: string): Promise<ParentPetDocument | null> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return Promise.resolve(null);
        }

        return this.parentPetModel.findOne({ _id: petObjectId, breederId: breederObjectId }).exec();
    }

    async updateParentPetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return;
        }

        const updateData: { photos: string[]; photoFileName?: string } = {
            photos: photoPaths,
            ...(photoPaths.length > 0 && { photoFileName: photoPaths[0] }),
        };

        await this.parentPetModel.findOneAndUpdate(
            { _id: petObjectId, breederId: breederObjectId },
            { $set: updateData },
        );
    }
}
