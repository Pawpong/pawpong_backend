import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../../schema/breeder-review.schema';
import { AdopterAdminActivityLogEntry } from '../application/ports/adopter-admin-writer.port';
import type {
    AdopterApplicationCustomResponseRecord,
    AdopterApplicationStandardResponsesRecord,
    AdopterObjectIdLike,
} from '../../types/adopter-application.type';

export type AdopterAdminNamedRecord = {
    _id: AdopterObjectIdLike;
    nickname?: string;
    name?: string;
};

export type AdopterAdminReviewRepositoryRecord = {
    _id: AdopterObjectIdLike;
    breederId?: { _id?: AdopterObjectIdLike; name?: string } | AdopterObjectIdLike | null;
    adopterId?: { _id?: AdopterObjectIdLike; nickname?: string } | AdopterObjectIdLike | null;
    reportedBy?: AdopterObjectIdLike;
    reportReason?: string;
    reportDescription?: string;
    reportedAt?: Date;
    content: string;
    writtenAt: Date;
    isVisible: boolean;
};

export type AdopterAdminApplicationRepositoryRecord = {
    _id: AdopterObjectIdLike;
    adopterName: string;
    adopterEmail: string;
    adopterPhone: string;
    breederId?: { _id?: AdopterObjectIdLike; name?: string } | AdopterObjectIdLike | null;
    petName?: string;
    status: string;
    standardResponses?: AdopterApplicationStandardResponsesRecord;
    customResponses?: AdopterApplicationCustomResponseRecord[];
    appliedAt: Date;
    processedAt?: Date;
    breederNotes?: string;
};

@Injectable()
export class AdopterAdminRepository {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(BreederReview.name) private readonly breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    findAdminById(adminId: string) {
        return this.adminModel.findById(adminId).select('permissions').lean().exec();
    }

    async findReportedReviews(
        page: number,
        limit: number,
    ): Promise<{ reviews: AdopterAdminReviewRepositoryRecord[]; totalCount: number }> {
        const skip = (page - 1) * limit;
        const [reviews, totalCount] = await Promise.all([
            this.breederReviewModel
                .find({ isReported: true })
                .sort({ reportedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('breederId', 'name')
                .populate('adopterId', 'nickname')
                .lean()
                .exec(),
            this.breederReviewModel.countDocuments({ isReported: true }).exec(),
        ]);

        return { reviews, totalCount };
    }

    findAdoptersByIds(adopterIds: Types.ObjectId[]): Promise<AdopterAdminNamedRecord[]> {
        if (adopterIds.length === 0) {
            return Promise.resolve([]);
        }

        return this.adopterModel
            .find({ _id: { $in: adopterIds } })
            .select('nickname')
            .lean()
            .exec() as Promise<AdopterAdminNamedRecord[]>;
    }

    findBreedersByIds(breederIds: Types.ObjectId[]): Promise<AdopterAdminNamedRecord[]> {
        if (breederIds.length === 0) {
            return Promise.resolve([]);
        }

        return this.breederModel
            .find({ _id: { $in: breederIds } })
            .select('name')
            .lean()
            .exec() as Promise<AdopterAdminNamedRecord[]>;
    }

    findBreedersByName(name: string): Promise<Array<{ _id: Types.ObjectId }>> {
        return this.breederModel
            .find({ name: { $regex: name, $options: 'i' } })
            .select('_id')
            .lean()
            .exec() as Promise<Array<{ _id: Types.ObjectId }>>;
    }

    countApplications(query: FilterQuery<AdoptionApplicationDocument>): Promise<number> {
        return this.adoptionApplicationModel.countDocuments(query).exec();
    }

    countApplicationsByStatus(query: FilterQuery<AdoptionApplicationDocument>, status: string): Promise<number> {
        return this.adoptionApplicationModel
            .countDocuments({
                ...query,
                status,
            })
            .exec();
    }

    findApplications(
        query: FilterQuery<AdoptionApplicationDocument>,
        page: number,
        limit: number,
    ): Promise<AdopterAdminApplicationRepositoryRecord[]> {
        return this.adoptionApplicationModel
            .find(query)
            .sort({ appliedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('breederId', 'name')
            .lean()
            .exec() as Promise<AdopterAdminApplicationRepositoryRecord[]>;
    }

    findApplicationById(applicationId: string): Promise<AdopterAdminApplicationRepositoryRecord | null> {
        return this.adoptionApplicationModel
            .findById(applicationId)
            .populate('breederId', 'name')
            .lean()
            .exec() as Promise<AdopterAdminApplicationRepositoryRecord | null>;
    }

    hideReview(breederId: string, reviewId: string) {
        return this.breederReviewModel
            .findOneAndUpdate(
                {
                    _id: reviewId,
                    breederId,
                },
                { $set: { isVisible: false } },
                { new: true },
            )
            .lean()
            .exec();
    }

    findBreederById(breederId: string) {
        return this.breederModel.findById(breederId).select('name').lean().exec();
    }

    async appendAdminActivity(adminId: string, logEntry: AdopterAdminActivityLogEntry): Promise<void> {
        await this.adminModel
            .updateOne({ _id: adminId }, {
                $push: {
                    activityLogs: logEntry,
                },
            } as UpdateQuery<AdminDocument>)
            .exec();
    }
}
