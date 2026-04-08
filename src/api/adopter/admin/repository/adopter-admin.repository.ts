import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import {
    AdoptionApplication,
    AdoptionApplicationDocument,
} from '../../../../schema/adoption-application.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../../schema/breeder-review.schema';
import { AdopterAdminActivityLogEntry } from '../application/ports/adopter-admin-writer.port';

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

    async findReportedReviews(page: number, limit: number): Promise<{ reviews: any[]; totalCount: number }> {
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

    findAdoptersByIds(adopterIds: Types.ObjectId[]) {
        if (adopterIds.length === 0) {
            return Promise.resolve([]);
        }

        return this.adopterModel.find({ _id: { $in: adopterIds } }).select('nickname').lean().exec();
    }

    findBreedersByIds(breederIds: Types.ObjectId[]) {
        if (breederIds.length === 0) {
            return Promise.resolve([]);
        }

        return this.breederModel.find({ _id: { $in: breederIds } }).select('name').lean().exec();
    }

    findBreedersByName(name: string) {
        return this.breederModel
            .find({ name: { $regex: name, $options: 'i' } })
            .select('_id')
            .lean()
            .exec();
    }

    countApplications(query: Record<string, any>): Promise<number> {
        return this.adoptionApplicationModel.countDocuments(query).exec();
    }

    countApplicationsByStatus(query: Record<string, any>, status: string): Promise<number> {
        return this.adoptionApplicationModel
            .countDocuments({
                ...query,
                status,
            })
            .exec();
    }

    findApplications(query: Record<string, any>, page: number, limit: number) {
        return this.adoptionApplicationModel
            .find(query)
            .sort({ appliedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('breederId', 'name')
            .lean()
            .exec();
    }

    findApplicationById(applicationId: string) {
        return this.adoptionApplicationModel.findById(applicationId).populate('breederId', 'name').lean().exec();
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
            .updateOne(
                { _id: adminId },
                {
                    $push: {
                        activityLogs: logEntry as any,
                    },
                },
            )
            .exec();
    }
}
