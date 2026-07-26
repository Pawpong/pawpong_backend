import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ApplicationStatus, UserStatus, VerificationStatus } from '../../../../common/enum/user.enum';
import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';

@Injectable()
export class PlatformAdminRepository {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    findAdminById(adminId: string) {
        return this.adminModel.findById(adminId).select('permissions').lean().exec();
    }

    countActiveAdopters(): Promise<number> {
        return this.adopterModel.countDocuments({ accountStatus: UserStatus.ACTIVE }).exec();
    }

    countActiveBreeders(): Promise<number> {
        return this.breederModel.countDocuments({ accountStatus: UserStatus.ACTIVE }).exec();
    }

    countApprovedBreeders(): Promise<number> {
        return this.breederModel.countDocuments({ 'verification.status': VerificationStatus.APPROVED }).exec();
    }

    countPendingBreeders(): Promise<number> {
        return this.breederModel.countDocuments({ 'verification.status': VerificationStatus.PENDING }).exec();
    }

    aggregateApplicationStats() {
        return this.breederModel.aggregate([
            { $unwind: '$receivedApplications' },
            {
                $group: {
                    _id: '$receivedApplications.status',
                    count: { $sum: 1 },
                },
            },
        ]);
    }

    aggregatePopularBreeds(limit: number) {
        return this.breederModel.aggregate([
            { $unwind: '$availablePets' },
            {
                $group: {
                    _id: { breed: '$availablePets.breed', type: '$availablePets.type' },
                    applicationCount: { $sum: 1 },
                    averagePrice: { $avg: '$availablePets.price' },
                },
            },
            { $sort: { applicationCount: -1 } },
            { $limit: limit },
        ]);
    }

    aggregateRegionalStats(limit: number) {
        return this.breederModel.aggregate([
            {
                $group: {
                    _id: { city: '$profile.location.city', district: '$profile.location.district' },
                    breederCount: { $sum: 1 },
                    applicationCount: { $sum: '$stats.totalApplications' },
                    completedAdoptionCount: { $sum: '$stats.completedAdoptions' },
                },
            },
            { $sort: { breederCount: -1 } },
            { $limit: limit },
        ]);
    }

    aggregateBreederPerformance(limit: number) {
        return this.breederModel.aggregate([
            {
                $project: {
                    breederId: '$_id',
                    breederName: '$name',
                    city: '$profile.location.city',
                    applicationCount: '$stats.totalApplications',
                    completedAdoptionCount: '$stats.completedAdoptions',
                    averageRating: '$stats.averageRating',
                    totalReviews: '$stats.totalReviews',
                    profileViews: '$stats.profileViews',
                },
            },
            { $sort: { applicationCount: -1 } },
            { $limit: limit },
        ]);
    }

    aggregateReportStats() {
        return this.breederModel.aggregate([
            { $unwind: '$reports' },
            {
                $group: {
                    _id: '$reports.status',
                    count: { $sum: 1 },
                },
            },
        ]);
    }

    countActiveAdoptersSince(since: Date): Promise<number> {
        return this.adopterModel
            .countDocuments({
                accountStatus: UserStatus.ACTIVE,
                lastLoginAt: { $gte: since },
            })
            .exec();
    }

    countActiveBreedersSince(since: Date): Promise<number> {
        return this.breederModel
            .countDocuments({
                accountStatus: UserStatus.ACTIVE,
                lastLoginAt: { $gte: since },
            })
            .exec();
    }

    countConsultationsSince(since: Date): Promise<number> {
        return this.adoptionApplicationModel.countDocuments({ appliedAt: { $gte: since } }).exec();
    }

    countApprovedAdoptionsSince(since: Date): Promise<number> {
        return this.adoptionApplicationModel
            .countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: since },
            })
            .exec();
    }

    aggregateTopLocations(limit: number) {
        return this.breederModel.aggregate([
            {
                $match: {
                    'verification.status': VerificationStatus.APPROVED,
                },
            },
            {
                $group: {
                    _id: '$profile.location.city',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
        ]);
    }

    aggregateTopBreeds(limit: number) {
        return this.breederModel.aggregate([
            { $unwind: '$availablePets' },
            {
                $group: {
                    _id: '$availablePets.breed',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: limit },
        ]);
    }

    countRejectedBreeders(): Promise<number> {
        return this.breederModel.countDocuments({ 'verification.status': VerificationStatus.REJECTED }).exec();
    }

    countResubmittedBreeders(): Promise<number> {
        return this.breederModel
            .countDocuments({
                'verification.status': { $in: [VerificationStatus.REVIEWING, VerificationStatus.APPROVED] },
                'verification.previousStatus': VerificationStatus.REJECTED,
            })
            .exec();
    }

    countResubmittedAndApprovedBreeders(): Promise<number> {
        return this.breederModel
            .countDocuments({
                'verification.status': VerificationStatus.APPROVED,
                'verification.previousStatus': VerificationStatus.REJECTED,
            })
            .exec();
    }
}
