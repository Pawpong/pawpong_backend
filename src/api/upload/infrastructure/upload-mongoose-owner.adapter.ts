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

    async replaceRepresentativePhotos(breederId: string, photoPaths: string[]): Promise<void> {
        await this.breederModel.findByIdAndUpdate(breederId, {
            $set: { 'profile.representativePhotos': photoPaths },
        });
    }

    async findOwnedAvailablePet(petId: string, breederId: string): Promise<UploadPhotoTarget | null> {
        const pet = await this.availablePetModel.findOne({
            _id: new Types.ObjectId(petId),
            breederId: new Types.ObjectId(breederId),
        });

        if (!pet) {
            return null;
        }

        return { photoPaths: [...(pet.photos || [])] };
    }

    async replaceAvailablePetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        await this.availablePetModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(petId),
                breederId: new Types.ObjectId(breederId),
            },
            {
                $set: { photos: photoPaths },
            },
        );
    }

    async findOwnedParentPet(petId: string, breederId: string): Promise<UploadPhotoTarget | null> {
        const pet = await this.parentPetModel.findOne({
            _id: new Types.ObjectId(petId),
            breederId: new Types.ObjectId(breederId),
        });

        if (!pet) {
            return null;
        }

        return { photoPaths: [...(pet.photos || [])] };
    }

    async replaceParentPetPhotos(petId: string, breederId: string, photoPaths: string[]): Promise<void> {
        const updateData: { photos: string[]; photoFileName?: string } = {
            photos: photoPaths,
            ...(photoPaths.length > 0 && { photoFileName: photoPaths[0] }),
        };

        await this.parentPetModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(petId),
                breederId: new Types.ObjectId(breederId),
            },
            {
                $set: updateData,
            },
        );
    }
}
