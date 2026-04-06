import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ApplicationStatus, UserStatus, VerificationStatus } from '../../../../common/enum/user.enum';
import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import {
    PlatformAdminAdminSnapshot,
    PlatformAdminFilterUsageItemSnapshot,
    PlatformAdminMvpStatsSnapshot,
    PlatformAdminReaderPort,
    PlatformAdminStatsFilterSnapshot,
    PlatformAdminStatsSnapshot,
} from '../application/ports/platform-admin-reader.port';

@Injectable()
export class PlatformAdminMongooseReaderAdapter implements PlatformAdminReaderPort {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    async findAdminById(adminId: string): Promise<PlatformAdminAdminSnapshot | null> {
        const admin = await this.adminModel.findById(adminId).select('permissions').lean();

        if (!admin) {
            return null;
        }

        return {
            id: admin._id.toString(),
            permissions: admin.permissions,
        };
    }

    async getStats(_filter: PlatformAdminStatsFilterSnapshot): Promise<PlatformAdminStatsSnapshot> {
        const [adoptersTotal, breedersTotal, breedersApproved, breedersPending] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: UserStatus.ACTIVE }),
            this.breederModel.countDocuments({ accountStatus: UserStatus.ACTIVE }),
            this.breederModel.countDocuments({ 'verification.status': VerificationStatus.APPROVED }),
            this.breederModel.countDocuments({ 'verification.status': VerificationStatus.PENDING }),
        ]);

        const applicationStats = await this.breederModel.aggregate([
            { $unwind: '$receivedApplications' },
            {
                $group: {
                    _id: '$receivedApplications.status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalApplications = applicationStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
        const pendingApplications =
            applicationStats.find((item: any) => item._id === ApplicationStatus.CONSULTATION_PENDING)?.count || 0;
        const completedAdoptions =
            applicationStats.find((item: any) => item._id === ApplicationStatus.ADOPTION_APPROVED)?.count || 0;
        const rejectedApplications =
            applicationStats.find((item: any) => item._id === ApplicationStatus.ADOPTION_REJECTED)?.count || 0;

        const popularBreeds = await this.breederModel.aggregate([
            { $unwind: '$availablePets' },
            {
                $group: {
                    _id: { breed: '$availablePets.breed', type: '$availablePets.type' },
                    applicationCount: { $sum: 1 },
                    averagePrice: { $avg: '$availablePets.price' },
                },
            },
            { $sort: { applicationCount: -1 } },
            { $limit: 10 },
        ]);

        const regionalStats = await this.breederModel.aggregate([
            {
                $group: {
                    _id: { city: '$profile.location.city', district: '$profile.location.district' },
                    breederCount: { $sum: 1 },
                    applicationCount: { $sum: '$stats.totalApplications' },
                    completedAdoptionCount: { $sum: '$stats.completedAdoptions' },
                },
            },
            { $sort: { breederCount: -1 } },
            { $limit: 10 },
        ]);

        const breederPerformance = await this.breederModel.aggregate([
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
            { $limit: 10 },
        ]);

        const reportStats = await this.breederModel.aggregate([
            { $unwind: '$reports' },
            {
                $group: {
                    _id: '$reports.status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const totalReports = reportStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
        const pendingReports = reportStats.find((item: any) => item._id === 'pending')?.count || 0;
        const resolvedReports = reportStats.find((item: any) => item._id === 'resolved')?.count || 0;
        const dismissedReports = reportStats.find((item: any) => item._id === 'dismissed')?.count || 0;

        return {
            userStatistics: {
                totalAdopterCount: adoptersTotal,
                newAdopterCount: 0,
                activeAdopterCount: adoptersTotal,
                totalBreederCount: breedersTotal,
                newBreederCount: 0,
                approvedBreederCount: breedersApproved,
                pendingBreederCount: breedersPending,
            },
            adoptionStatistics: {
                totalApplicationCount: totalApplications,
                newApplicationCount: 0,
                completedAdoptionCount: completedAdoptions,
                pendingApplicationCount: pendingApplications,
                rejectedApplicationCount: rejectedApplications,
            },
            popularBreeds: popularBreeds.map((breed: any) => ({
                breedName: breed._id.breed,
                petType: breed._id.type,
                applicationCount: breed.applicationCount,
                completedAdoptionCount: 0,
                averagePrice: breed.averagePrice || 0,
            })),
            regionalStatistics: regionalStats.map((region: any) => ({
                cityName: region._id.city || 'Unknown',
                districtName: region._id.district || 'Unknown',
                breederCount: region.breederCount,
                applicationCount: region.applicationCount || 0,
                completedAdoptionCount: region.completedAdoptionCount || 0,
            })),
            breederPerformanceRanking: breederPerformance.map((breeder: any) => ({
                breederId: breeder.breederId.toString(),
                breederName: breeder.breederName,
                cityName: breeder.city || 'Unknown',
                applicationCount: breeder.applicationCount || 0,
                completedAdoptionCount: breeder.completedAdoptionCount || 0,
                averageRating: breeder.averageRating || 0,
                totalReviewCount: breeder.totalReviews || 0,
                profileViewCount: breeder.profileViews || 0,
            })),
            reportStatistics: {
                totalReportCount: totalReports,
                newReportCount: 0,
                resolvedReportCount: resolvedReports,
                pendingReportCount: pendingReports,
                dismissedReportCount: dismissedReports,
            },
        };
    }

    async getMvpStats(): Promise<PlatformAdminMvpStatsSnapshot> {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

        const [adopters7Days, adopters14Days, adopters28Days, breeders7Days, breeders14Days, breeders28Days] =
            await Promise.all([
                this.adopterModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: sevenDaysAgo },
                }),
                this.adopterModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: fourteenDaysAgo },
                }),
                this.adopterModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: twentyEightDaysAgo },
                }),
                this.breederModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: sevenDaysAgo },
                }),
                this.breederModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: fourteenDaysAgo },
                }),
                this.breederModel.countDocuments({
                    accountStatus: UserStatus.ACTIVE,
                    lastLoginAt: { $gte: twentyEightDaysAgo },
                }),
            ]);

        const [
            consultations7Days,
            consultations14Days,
            consultations28Days,
            adoptions7Days,
            adoptions14Days,
            adoptions28Days,
        ] = await Promise.all([
            this.adoptionApplicationModel.countDocuments({
                appliedAt: { $gte: sevenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                appliedAt: { $gte: fourteenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                appliedAt: { $gte: twentyEightDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: sevenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: fourteenDaysAgo },
            }),
            this.adoptionApplicationModel.countDocuments({
                status: ApplicationStatus.ADOPTION_APPROVED,
                processedAt: { $gte: twentyEightDaysAgo },
            }),
        ]);

        const topLocations = await this.breederModel.aggregate([
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
            { $limit: 10 },
        ]);

        const topBreeds = await this.breederModel.aggregate([
            { $unwind: '$availablePets' },
            {
                $group: {
                    _id: '$availablePets.breed',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        const [rejectedBreeders, resubmittedBreeders, resubmittedAndApproved] = await Promise.all([
            this.breederModel.countDocuments({
                'verification.status': VerificationStatus.REJECTED,
            }),
            this.breederModel.countDocuments({
                'verification.status': { $in: [VerificationStatus.REVIEWING, VerificationStatus.APPROVED] },
                'verification.previousStatus': VerificationStatus.REJECTED,
            }),
            this.breederModel.countDocuments({
                'verification.status': VerificationStatus.APPROVED,
                'verification.previousStatus': VerificationStatus.REJECTED,
            }),
        ]);

        const totalRejections = rejectedBreeders + resubmittedBreeders;
        const resubmissions = resubmittedBreeders;
        const resubmissionRate = totalRejections > 0 ? (resubmissions / totalRejections) * 100 : 0;
        const resubmissionApprovalRate = resubmissions > 0 ? (resubmittedAndApproved / resubmissions) * 100 : 0;

        return {
            activeUserStats: {
                adopters7Days,
                adopters14Days,
                adopters28Days,
                breeders7Days,
                breeders14Days,
                breeders28Days,
            },
            consultationStats: {
                consultations7Days,
                consultations14Days,
                consultations28Days,
                adoptions7Days,
                adoptions14Days,
                adoptions28Days,
            },
            filterUsageStats: {
                topLocations: topLocations.map((location: any) =>
                    this.toFilterUsageItem('location', location._id || 'Unknown', location.count),
                ),
                topBreeds: topBreeds.map((breed: any) =>
                    this.toFilterUsageItem('breed', breed._id || 'Unknown', breed.count),
                ),
                emptyResultFilters: [],
            },
            breederResubmissionStats: {
                totalRejections,
                resubmissions,
                resubmissionRate: Math.round(resubmissionRate),
                resubmissionApprovals: resubmittedAndApproved,
                resubmissionApprovalRate: Math.round(resubmissionApprovalRate),
            },
        };
    }

    private toFilterUsageItem(
        filterType: string,
        filterValue: string,
        usageCount: number,
    ): PlatformAdminFilterUsageItemSnapshot {
        return {
            filterType,
            filterValue,
            usageCount,
        };
    }
}
