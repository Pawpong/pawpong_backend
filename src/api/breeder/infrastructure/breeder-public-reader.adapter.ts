import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import { ParentPet, ParentPetDocument } from '../../../schema/parent-pet.schema';
import type {
    BreederPublicBreederRecord,
    BreederPublicPetRecord,
    BreederPublicReaderPort,
} from '../application/ports/breeder-public-reader.port';

@Injectable()
export class BreederPublicReaderAdapter implements BreederPublicReaderPort {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(BreederReview.name) private readonly breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
    ) {}

    async searchPublicBreeders(
        filter: Record<string, unknown>,
        sortOrder: Record<string, 1 | -1>,
        page: number,
        limit: number,
    ): Promise<{ breeders: BreederPublicBreederRecord[]; total: number }> {
        const skip = (page - 1) * limit;
        const [breeders, total] = await Promise.all([
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

        return {
            breeders: breeders as unknown as BreederPublicBreederRecord[],
            total,
        };
    }

    async findPopularPublicBreeders(limit: number): Promise<BreederPublicBreederRecord[]> {
        const breeders = await this.breederModel
            .find({
                'verification.status': 'approved',
                accountStatus: 'active',
                isTestAccount: { $ne: true },
            })
            .sort({ 'stats.totalFavorites': -1, 'stats.averageRating': -1 })
            .limit(limit)
            .lean()
            .exec();

        return breeders as unknown as BreederPublicBreederRecord[];
    }

    async findPublicBreederById(breederId: string): Promise<BreederPublicBreederRecord | null> {
        const breeder = await this.breederModel
            .findById(breederId)
            .select('-password -socialAuth -receivedApplications -reports')
            .lean()
            .exec();

        return (breeder as unknown as BreederPublicBreederRecord | null) || null;
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

    async findActiveAvailablePetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]> {
        const availablePets = await this.availablePetModel
            .find({ breederId: new Types.ObjectId(breederId), isActive: true })
            .populate('parentInfo.mother')
            .populate('parentInfo.father')
            .lean()
            .exec();

        return availablePets as unknown as BreederPublicPetRecord[];
    }

    async findActiveParentPetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]> {
        const parentPets = await this.parentPetModel
            .find({ breederId: new Types.ObjectId(breederId), isActive: true })
            .lean()
            .exec();

        return parentPets as unknown as BreederPublicPetRecord[];
    }

    async findVisibleBreederReviewsByBreederId(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<{ reviews: any[]; total: number }> {
        const breederOid = new Types.ObjectId(breederId);
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
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

        return { reviews, total };
    }
}
