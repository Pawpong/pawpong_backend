import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import { ParentPet, ParentPetDocument } from '../../../schema/parent-pet.schema';

@Injectable()
export class BreederPublicRepository {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(BreederReview.name) private readonly breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
    ) {}

    searchPublicBreeders(filter: Record<string, unknown>, sortOrder: Record<string, 1 | -1>, page: number, limit: number) {
        const skip = (page - 1) * limit;

        return Promise.all([
            this.breederModel
                .find(filter)
                .select('-password -socialAuth -receivedApplications -reports')
                .sort(sortOrder)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.breederModel.countDocuments(filter).exec(),
        ]);
    }

    findPopularPublicBreeders(limit: number) {
        return this.breederModel
            .find({
                'verification.status': 'approved',
                accountStatus: 'active',
                isTestAccount: { $ne: true },
            })
            .sort({ 'stats.totalFavorites': -1, 'stats.averageRating': -1 })
            .limit(limit)
            .lean()
            .exec();
    }

    findPublicBreederById(breederId: string) {
        return this.breederModel
            .findById(breederId)
            .select('-password -socialAuth -receivedApplications -reports')
            .lean()
            .exec();
    }

    async findAdopterFavoriteBreederIds(userId: string): Promise<string[] | null> {
        const adopter = await this.adopterModel.findById(userId).select('favoriteBreederList').lean().exec();
        if (!adopter) {
            return null;
        }

        return (adopter.favoriteBreederList || []).map((favorite: any) => favorite.favoriteBreederId);
    }

    async findBreederFavoriteBreederIds(userId: string): Promise<string[] | null> {
        const breeder = await this.breederModel.findById(userId).select('favoriteBreederList').lean().exec();
        if (!breeder) {
            return null;
        }

        return (((breeder as any).favoriteBreederList || []) as any[]).map((favorite) => favorite.favoriteBreederId);
    }

    async findBreederIdsWithAvailablePets(): Promise<string[]> {
        const breederIds = await this.availablePetModel.distinct('breederId', {
            isActive: true,
            status: 'available',
        });

        return breederIds.map((id) => String(id));
    }

    async incrementProfileViews(breederId: string): Promise<void> {
        await this.breederModel.findByIdAndUpdate(breederId, { $inc: { 'stats.profileViews': 1 } }).exec();
    }

    findActiveAvailablePetsByBreederId(breederId: string) {
        return this.availablePetModel
            .find({ breederId: new Types.ObjectId(breederId), isActive: true })
            .populate('parentInfo.mother')
            .populate('parentInfo.father')
            .lean()
            .exec();
    }

    findActiveParentPetsByBreederId(breederId: string) {
        return this.parentPetModel.find({ breederId: new Types.ObjectId(breederId), isActive: true }).lean().exec();
    }

    findVisibleBreederReviewsByBreederId(breederId: string, page: number, limit: number) {
        const breederOid = new Types.ObjectId(breederId);
        const skip = (page - 1) * limit;

        return Promise.all([
            this.breederReviewModel
                .find({ breederId: breederOid, isVisible: true })
                .sort({ writtenAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adopterId', 'nickname')
                .populate('applicationId', 'petName')
                .lean()
                .exec(),
            this.breederReviewModel.countDocuments({ breederId: breederOid, isVisible: true }).exec(),
        ]);
    }
}
