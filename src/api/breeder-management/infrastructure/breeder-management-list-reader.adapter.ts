import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { PetStatus } from '../../../common/enum/user.enum';
import { BreederReview, BreederReviewDocument } from '../../../schema/breeder-review.schema';
import { AdoptionApplicationRepository } from '../repository/adoption-application.repository';
import { AvailablePetManagementRepository } from '../repository/available-pet-management.repository';
import { BreederRepository } from '../repository/breeder.repository';
import type {
    BreederManagementBreederSummary,
    BreederManagementListReaderPort,
    BreederManagementPetRecord,
    BreederManagementReceivedApplicationRecord,
    BreederManagementReviewRecord,
} from '../application/ports/breeder-management-list-reader.port';

@Injectable()
export class BreederManagementListReaderAdapter implements BreederManagementListReaderPort {
    constructor(
        private readonly breederRepository: BreederRepository,
        private readonly adoptionApplicationRepository: AdoptionApplicationRepository,
        private readonly availablePetRepository: AvailablePetManagementRepository,
        @InjectModel(BreederReview.name) private readonly breederReviewModel: Model<BreederReviewDocument>,
    ) {}

    async findBreederSummary(userId: string): Promise<BreederManagementBreederSummary | null> {
        const breeder = await this.breederRepository.findById(userId);
        if (!breeder) {
            return null;
        }

        return {
            averageRating: breeder.stats?.averageRating || 0,
        };
    }

    async findReceivedApplications(
        userId: string,
        page: number,
        limit: number,
    ): Promise<{ applications: BreederManagementReceivedApplicationRecord[]; total: number }> {
        const result = await this.adoptionApplicationRepository.findByBreederId(userId, page, limit);

        return {
            applications: result.applications as unknown as BreederManagementReceivedApplicationRecord[],
            total: result.total,
        };
    }

    async findMyPetsSnapshot(
        userId: string,
        options: {
            status?: string;
            includeInactive: boolean;
            page: number;
            limit: number;
        },
    ): Promise<{
        pets: BreederManagementPetRecord[];
        total: number;
        availableCount: number;
        reservedCount: number;
        adoptedCount: number;
        inactiveCount: number;
        applicationCountMap: Map<string, number>;
    }> {
        const [statsResult, availableCount, reservedCount, adoptedCount, inactiveCount] = await Promise.all([
            this.availablePetRepository.findByBreederIdWithFilters(userId, options),
            this.availablePetRepository.countByStatus(userId, PetStatus.AVAILABLE, true),
            this.availablePetRepository.countByStatus(userId, PetStatus.RESERVED, true),
            this.availablePetRepository.countByStatus(userId, PetStatus.ADOPTED, true),
            this.availablePetRepository.countInactive(userId),
        ]);

        const petIds = statsResult.pets.map((pet: any) => pet.petId || String(pet._id));
        const applicationCountMap = await this.adoptionApplicationRepository.countByPetIds(petIds);

        return {
            pets: statsResult.pets as unknown as BreederManagementPetRecord[],
            total: statsResult.total,
            availableCount,
            reservedCount,
            adoptedCount,
            inactiveCount,
            applicationCountMap,
        };
    }

    async findMyReviewsSnapshot(
        userId: string,
        visibility: string,
        page: number,
        limit: number,
    ): Promise<{
        reviews: BreederManagementReviewRecord[];
        filteredTotal: number;
        totalCount: number;
        visibleCount: number;
        hiddenCount: number;
    }> {
        const breederId = new Types.ObjectId(userId);
        const filter: Record<string, unknown> = { breederId };

        if (visibility === 'visible') {
            filter.isVisible = true;
        } else if (visibility === 'hidden') {
            filter.isVisible = false;
        }

        const [totalCount, visibleCount] = await Promise.all([
            this.breederReviewModel.countDocuments({ breederId }),
            this.breederReviewModel.countDocuments({ breederId, isVisible: true }),
        ]);
        const hiddenCount = totalCount - visibleCount;
        const skip = (page - 1) * limit;
        const reviews = await this.breederReviewModel
            .find(filter)
            .sort({ writtenAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('adopterId', 'name nickname')
            .lean()
            .exec();

        const filteredTotal = visibility === 'all' ? totalCount : await this.breederReviewModel.countDocuments(filter);

        return {
            reviews: reviews as unknown as BreederManagementReviewRecord[],
            filteredTotal,
            totalCount,
            visibleCount,
            hiddenCount,
        };
    }
}
