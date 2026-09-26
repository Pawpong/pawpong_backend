import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../../../schema/available-pet.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../../schema/breeder-review.schema';
import { ParentPet, ParentPetDocument } from '../../../../schema/parent-pet.schema';
import type {
    BreederPublicBreederRecord,
    BreederPublicParentPetRecord,
    BreederPublicPetRecord,
    BreederPublicReviewRecord,
} from '../application/ports/breeder-public-reader.port';
import { CONTENT_RIGHTS_VERSION, eligibleAppAuthorIds, isIosAppRequest } from '../../../../common/content-rights/app-request-context';

@Injectable()
export class BreederPublicRepository {
    constructor(
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(BreederReview.name) private readonly breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(ParentPet.name) private readonly parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private readonly availablePetModel: Model<AvailablePetDocument>,
    ) {}

    searchPublicBreeders(
        filter: Record<string, unknown>,
        sortOrder: Record<string, 1 | -1>,
        page: number,
        limit: number,
    ): Promise<[BreederPublicBreederRecord[], number]> {
        const skip = (page - 1) * limit;
        const publicFilter = isIosAppRequest()
            ? { ...filter, contentRightsConsentVersion: CONTENT_RIGHTS_VERSION }
            : filter;

        return Promise.all([
            this.breederModel
                .find(publicFilter)
                .select('-password -socialAuth -receivedApplications -reports')
                .sort(sortOrder)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec() as Promise<BreederPublicBreederRecord[]>,
            this.breederModel.countDocuments(publicFilter).exec(),
        ]);
    }

    findPopularPublicBreeders(limit: number): Promise<BreederPublicBreederRecord[]> {
        return this.breederModel
            .find({
                'verification.status': 'approved',
                accountStatus: 'active',
                isTestAccount: { $ne: true },
                ...(isIosAppRequest() ? { contentRightsConsentVersion: CONTENT_RIGHTS_VERSION } : {}),
            })
            .sort({ 'stats.totalFavorites': -1, 'stats.averageRating': -1 })
            .limit(limit)
            .lean()
            .exec() as Promise<BreederPublicBreederRecord[]>;
    }

    findPublicBreederById(breederId: string): Promise<BreederPublicBreederRecord | null> {
        return this.breederModel
            .findOne({ _id: breederId, ...(isIosAppRequest() ? { contentRightsConsentVersion: CONTENT_RIGHTS_VERSION } : {}) })
            .select('-password -socialAuth -receivedApplications -reports')
            .lean()
            .exec() as Promise<BreederPublicBreederRecord | null>;
    }

    async findAdopterFavoriteBreederIds(userId: string): Promise<string[] | null> {
        const adopter = await this.adopterModel.findById(userId).select('favoriteBreederList').lean().exec();
        if (!adopter) {
            return null;
        }

        return (adopter.favoriteBreederList || []).map((favorite) => favorite.favoriteBreederId);
    }

    async findBreederFavoriteBreederIds(userId: string): Promise<string[] | null> {
        const breeder = await this.breederModel.findById(userId).select('favoriteBreederList').lean().exec();
        if (!breeder) {
            return null;
        }

        return (breeder.favoriteBreederList || []).map((favorite) => favorite.favoriteBreederId);
    }

    async findBreederIdsWithAvailablePets(): Promise<string[]> {
        const breederIds = await this.availablePetModel.distinct('breederId', {
            isActive: true,
            status: 'available',
        });
        if (!isIosAppRequest()) return breederIds.map((id) => String(id));
        const approved = await this.breederModel.distinct('_id', {
            _id: { $in: breederIds },
            contentRightsConsentVersion: CONTENT_RIGHTS_VERSION,
        });
        return approved.map((id) => String(id));
    }

    async incrementProfileViews(breederId: string): Promise<void> {
        await this.breederModel.findByIdAndUpdate(breederId, { $inc: { 'stats.profileViews': 1 } }).exec();
    }

    async findActiveAvailablePetsByBreederId(breederId: string): Promise<BreederPublicPetRecord[]> {
        if (isIosAppRequest() && !(await this.isApprovedBreeder(breederId))) return [];
        return this.availablePetModel
            .find({ breederId: new Types.ObjectId(breederId), isActive: true })
            .populate('parentInfo.mother')
            .populate('parentInfo.father')
            .lean()
            .exec() as Promise<BreederPublicPetRecord[]>;
    }

    async findActiveParentPetsByBreederId(breederId: string): Promise<BreederPublicParentPetRecord[]> {
        if (isIosAppRequest() && !(await this.isApprovedBreeder(breederId))) return [];
        return this.parentPetModel
            .find({ breederId: new Types.ObjectId(breederId), isActive: true })
            .lean()
            .exec() as Promise<BreederPublicParentPetRecord[]>;
    }

    async findVisibleBreederReviewsByBreederId(
        breederId: string,
        page: number,
        limit: number,
    ): Promise<[BreederPublicReviewRecord[], number]> {
        if (isIosAppRequest() && !(await this.isApprovedBreeder(breederId))) return [[], 0];
        const breederOid = new Types.ObjectId(breederId);
        const skip = (page - 1) * limit;
        const reviewFilter = {
            breederId: breederOid,
            isVisible: true,
            ...(isIosAppRequest() ? { adopterId: { $in: await eligibleAppAuthorIds(this.breederReviewModel.db) } } : {}),
        };

        return Promise.all([
            this.breederReviewModel
                .find(reviewFilter)
                .sort({ writtenAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('adopterId', 'nickname')
                .populate('applicationId', 'petName')
                .lean()
                .exec() as Promise<BreederPublicReviewRecord[]>,
            this.breederReviewModel.countDocuments(reviewFilter).exec(),
        ]);
    }

    private async isApprovedBreeder(breederId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(breederId)) return false;
        return Boolean(await this.breederModel.exists({
            _id: new Types.ObjectId(breederId),
            contentRightsConsentVersion: CONTENT_RIGHTS_VERSION,
        }));
    }
}
