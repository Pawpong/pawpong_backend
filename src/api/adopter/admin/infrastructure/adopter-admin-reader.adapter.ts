import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ApplicationStatus } from '../../../../common/enum/user.enum';
import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../../schema/breeder-review.schema';
import {
    AdoptionApplication,
    AdoptionApplicationDocument,
} from '../../../../schema/adoption-application.schema';
import {
    AdopterAdminAdminSnapshot,
    AdopterAdminApplicationDetailSnapshot,
    AdopterAdminApplicationListFilterSnapshot,
    AdopterAdminApplicationListSnapshot,
    AdopterAdminReaderPort,
    AdopterAdminReviewReportPageSnapshot,
} from '../application/ports/adopter-admin-reader.port';

@Injectable()
export class AdopterAdminReaderAdapter implements AdopterAdminReaderPort {
    constructor(
        @InjectModel(Admin.name)
        private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Adopter.name)
        private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<BreederDocument>,
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(AdoptionApplication.name)
        private readonly adoptionApplicationModel: Model<AdoptionApplicationDocument>,
    ) {}

    async findAdminById(adminId: string): Promise<AdopterAdminAdminSnapshot | null> {
        const admin = await this.adminModel.findById(adminId).select('permissions').lean().exec();

        if (!admin) {
            return null;
        }

        return {
            adminId: admin._id.toString(),
            permissions: {
                canManageReports: admin.permissions?.canManageReports ?? false,
                canViewStatistics: admin.permissions?.canViewStatistics ?? false,
            },
        };
    }

    async findReportedReviews(page: number, limit: number): Promise<AdopterAdminReviewReportPageSnapshot> {
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

        const reporterIds = Array.from(
            new Set(
                reviews
                    .map((review: any) => review.reportedBy?.toString())
                    .filter((value): value is string => Boolean(value)),
            ),
        ).map((value) => new Types.ObjectId(value));

        const [reportingAdopters, reportingBreeders] = await Promise.all([
            reporterIds.length > 0
                ? this.adopterModel.find({ _id: { $in: reporterIds } }).select('nickname').lean().exec()
                : Promise.resolve([]),
            reporterIds.length > 0
                ? this.breederModel.find({ _id: { $in: reporterIds } }).select('name').lean().exec()
                : Promise.resolve([]),
        ]);

        const adopterReporterMap = new Map(
            reportingAdopters.map((adopter: any) => [adopter._id.toString(), adopter.nickname]),
        );
        const breederReporterMap = new Map(
            reportingBreeders.map((breeder: any) => [breeder._id.toString(), breeder.name]),
        );

        return {
            items: reviews.map((review: any) => {
                const reporterId = review.reportedBy?.toString();
                const breeder = review.breederId as any;
                const author = review.adopterId as any;

                return {
                    reviewId: review._id.toString(),
                    breederId: breeder?._id?.toString() || breeder?.toString() || '',
                    breederName: breeder?.name || 'Unknown',
                    authorId: author?._id?.toString() || author?.toString() || '',
                    authorName: author?.nickname || 'Unknown',
                    reportedBy: reporterId,
                    reporterName:
                        (reporterId && adopterReporterMap.get(reporterId)) ||
                        (reporterId && breederReporterMap.get(reporterId)) ||
                        'Unknown',
                    reportReason: review.reportReason,
                    reportDescription: review.reportDescription,
                    reportedAt: review.reportedAt,
                    content: review.content,
                    writtenAt: review.writtenAt,
                    isVisible: review.isVisible,
                };
            }),
            totalCount,
            page,
            limit,
        };
    }

    async findApplicationList(
        filter: AdopterAdminApplicationListFilterSnapshot,
    ): Promise<AdopterAdminApplicationListSnapshot> {
        const query: Record<string, any> = {};

        if (filter.status) {
            query.status = filter.status;
        }

        if (filter.breederName) {
            const breeders = await this.breederModel
                .find({ name: { $regex: filter.breederName, $options: 'i' } })
                .select('_id')
                .lean()
                .exec();

            if (breeders.length === 0) {
                return {
                    items: [],
                    totalCount: 0,
                    pendingCount: 0,
                    completedCount: 0,
                    approvedCount: 0,
                    rejectedCount: 0,
                    page: filter.page,
                    limit: filter.limit,
                };
            }

            query.breederId = { $in: breeders.map((breeder: any) => breeder._id) };
        }

        if (filter.startDate || filter.endDate) {
            query.appliedAt = {};

            if (filter.startDate) {
                query.appliedAt.$gte = new Date(filter.startDate);
            }

            if (filter.endDate) {
                const endDateTime = new Date(filter.endDate);
                endDateTime.setHours(23, 59, 59, 999);
                query.appliedAt.$lte = endDateTime;
            }
        }

        const [totalCount, pendingCount, completedCount, approvedCount, rejectedCount, applications] =
            await Promise.all([
                this.adoptionApplicationModel.countDocuments(query).exec(),
                this.adoptionApplicationModel
                    .countDocuments({
                        ...query,
                        status: ApplicationStatus.CONSULTATION_PENDING,
                    })
                    .exec(),
                this.adoptionApplicationModel
                    .countDocuments({
                        ...query,
                        status: ApplicationStatus.CONSULTATION_COMPLETED,
                    })
                    .exec(),
                this.adoptionApplicationModel
                    .countDocuments({
                        ...query,
                        status: ApplicationStatus.ADOPTION_APPROVED,
                    })
                    .exec(),
                this.adoptionApplicationModel
                    .countDocuments({
                        ...query,
                        status: ApplicationStatus.ADOPTION_REJECTED,
                    })
                    .exec(),
                this.adoptionApplicationModel
                    .find(query)
                    .sort({ appliedAt: -1 })
                    .skip((filter.page - 1) * filter.limit)
                    .limit(filter.limit)
                    .populate('breederId', 'name')
                    .lean()
                    .exec(),
            ]);

        return {
            items: applications.map((application: any) => {
                const breeder = application.breederId as any;

                return {
                    applicationId: application._id.toString(),
                    adopterName: application.adopterName,
                    adopterEmail: application.adopterEmail,
                    adopterPhone: application.adopterPhone,
                    breederId: breeder?._id ? breeder._id.toString() : breeder ? breeder.toString() : '',
                    breederName: breeder?.name || '알 수 없음',
                    petName: application.petName,
                    status: application.status,
                    appliedAt: application.appliedAt,
                    processedAt: application.processedAt,
                };
            }),
            totalCount,
            pendingCount,
            completedCount,
            approvedCount,
            rejectedCount,
            page: filter.page,
            limit: filter.limit,
        };
    }

    async findApplicationDetail(applicationId: string): Promise<AdopterAdminApplicationDetailSnapshot | null> {
        const application = await this.adoptionApplicationModel
            .findById(applicationId)
            .populate('breederId', 'name')
            .lean()
            .exec();

        if (!application) {
            return null;
        }

        const breeder = application.breederId as any;

        return {
            applicationId: application._id.toString(),
            adopterName: application.adopterName,
            adopterEmail: application.adopterEmail,
            adopterPhone: application.adopterPhone,
            breederId: breeder?._id ? breeder._id.toString() : breeder ? breeder.toString() : '',
            breederName: breeder?.name || '알 수 없음',
            petName: application.petName,
            status: application.status as ApplicationStatus,
            standardResponses: application.standardResponses || {},
            customResponses: application.customResponses || [],
            appliedAt: application.appliedAt,
            processedAt: application.processedAt,
            breederNotes: application.breederNotes,
        };
    }
}
