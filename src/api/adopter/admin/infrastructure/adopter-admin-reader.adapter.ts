import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { ApplicationStatus } from '../../../../common/enum/user.enum';
import {
    AdopterAdminAdminSnapshot,
    AdopterAdminApplicationDetailSnapshot,
    AdopterAdminApplicationListFilterSnapshot,
    AdopterAdminApplicationListSnapshot,
    AdopterAdminReaderPort,
    AdopterAdminReviewReportPageSnapshot,
} from '../application/ports/adopter-admin-reader.port';
import { AdopterAdminRepository } from '../repository/adopter-admin.repository';

@Injectable()
export class AdopterAdminReaderAdapter implements AdopterAdminReaderPort {
    constructor(private readonly adopterAdminRepository: AdopterAdminRepository) {}

    async findAdminById(adminId: string): Promise<AdopterAdminAdminSnapshot | null> {
        const admin = await this.adopterAdminRepository.findAdminById(adminId);

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
        const { reviews, totalCount } = await this.adopterAdminRepository.findReportedReviews(page, limit);

        const reporterIds = Array.from(
            new Set(
                reviews
                    .map((review: any) => review.reportedBy?.toString())
                    .filter((value): value is string => Boolean(value)),
            ),
        ).map((value) => new Types.ObjectId(value));

        const [reportingAdopters, reportingBreeders] = await Promise.all([
            this.adopterAdminRepository.findAdoptersByIds(reporterIds),
            this.adopterAdminRepository.findBreedersByIds(reporterIds),
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
            const breeders = await this.adopterAdminRepository.findBreedersByName(filter.breederName);

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
                this.adopterAdminRepository.countApplications(query),
                this.adopterAdminRepository.countApplicationsByStatus(query, ApplicationStatus.CONSULTATION_PENDING),
                this.adopterAdminRepository.countApplicationsByStatus(query, ApplicationStatus.CONSULTATION_COMPLETED),
                this.adopterAdminRepository.countApplicationsByStatus(query, ApplicationStatus.ADOPTION_APPROVED),
                this.adopterAdminRepository.countApplicationsByStatus(query, ApplicationStatus.ADOPTION_REJECTED),
                this.adopterAdminRepository.findApplications(query, filter.page, filter.limit),
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
        const application = await this.adopterAdminRepository.findApplicationById(applicationId);

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
