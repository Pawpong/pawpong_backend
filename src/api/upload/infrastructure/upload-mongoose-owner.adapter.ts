import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { ParentPet, ParentPetDocument } from '../../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { UploadOwnerPort, UploadPhotoTarget } from '../application/ports/upload-owner.port';

@Injectable()
export class UploadMongooseOwnerAdapter implements UploadOwnerPort {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
    ) {}

    private toObjectIdOrNull(value: string): Types.ObjectId | null {
        return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
    }

    async replaceRepresentativePhotos(breederId: string, photoPaths: string[]): Promise<void> {
        await this.breederModel.findByIdAndUpdate(breederId, {
            $set: { 'profile.representativePhotos': photoPaths },
        });
    }

    async findOwnedAvailablePet(petId: string, breederId: string): Promise<UploadPhotoTarget | null> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return null;
        }

        const pet = await this.availablePetModel.findOne({
            _id: petObjectId,
            breederId: breederObjectId,
        });

        if (!pet) {
            return null;
        }

        return { photoPaths: [...(pet.photos || [])] };
    }

    async replaceAvailablePetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return;
        }

        await this.availablePetModel.findOneAndUpdate(
            {
                _id: petObjectId,
                breederId: breederObjectId,
            },
            {
                $set: { photos: photoPaths },
            },
        );
    }

    async findOwnedParentPet(petId: string, breederId: string): Promise<UploadPhotoTarget | null> {
        const petObjectId = this.toObjectIdOrNull(petId);
        const breederObjectId = this.toObjectIdOrNull(breederId);
        if (!petObjectId || !breederObjectId) {
            return null;
        }

        const pet = await this.parentPetModel.findOne({
            _id: petObjectId,
            breederId: breederObjectId,
        });

        if (!pet) {
            return null;
        }

        return { photoPaths: [...(pet.photos || [])] };
    }

    async replaceParentPetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
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
            {
                _id: petObjectId,
                breederId: breederObjectId,
            },
            {
                $set: updateData,
            },
        );
    }
}
