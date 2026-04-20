import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { ApplicationStatus } from '../../../../common/enum/user.enum';
import type { AdopterObjectIdLike } from '../../types/adopter-application.type';
import {
    AdopterAdminAdminSnapshot,
    AdopterAdminApplicationDetailSnapshot,
    AdopterAdminApplicationListFilterSnapshot,
    AdopterAdminApplicationListSnapshot,
    AdopterAdminReaderPort,
    AdopterAdminReviewReportPageSnapshot,
} from '../application/ports/adopter-admin-reader.port';
import {
    AdopterAdminApplicationRepositoryRecord,
    AdopterAdminNamedRecord,
    AdopterAdminRepository,
    AdopterAdminReviewRepositoryRecord,
} from '../repository/adopter-admin.repository';

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
                    .map((review) => review.reportedBy?.toString())
                    .filter((value): value is string => Boolean(value)),
            ),
        ).map((value) => new Types.ObjectId(value));

        const [reportingAdopters, reportingBreeders] = await Promise.all([
            this.adopterAdminRepository.findAdoptersByIds(reporterIds),
            this.adopterAdminRepository.findBreedersByIds(reporterIds),
        ]);

        const adopterReporterMap = new Map(
            reportingAdopters.map((adopter: AdopterAdminNamedRecord) => [adopter._id.toString(), adopter.nickname]),
        );
        const breederReporterMap = new Map(
            reportingBreeders.map((breeder: AdopterAdminNamedRecord) => [breeder._id.toString(), breeder.name]),
        );

        return {
            items: reviews.map((review: AdopterAdminReviewRepositoryRecord) => {
                const reporterId = review.reportedBy?.toString();
                const breeder = review.breederId;
                const author = review.adopterId;

                return {
                    reviewId: review._id.toString(),
                    breederId: this.toReferencedId(breeder),
                    breederName: this.toReferencedName(breeder, 'name', 'Unknown'),
                    authorId: this.toReferencedId(author),
                    authorName: this.toReferencedName(author, 'nickname', 'Unknown'),
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
        const query: {
            status?: ApplicationStatus;
            breederId?: { $in: Types.ObjectId[] };
            appliedAt?: {
                $gte?: Date;
                $lte?: Date;
            };
        } = {};

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

            query.breederId = { $in: breeders.map((breeder) => breeder._id) };
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
            items: applications.map((application: AdopterAdminApplicationRepositoryRecord) => {
                const breeder = application.breederId;

                return {
                    applicationId: application._id.toString(),
                    adopterName: application.adopterName,
                    adopterEmail: application.adopterEmail,
                    adopterPhone: application.adopterPhone,
                    breederId: this.toReferencedId(breeder),
                    breederName: this.toReferencedName(breeder, 'name', '알 수 없음'),
                    petName: application.petName,
                    status: application.status as ApplicationStatus,
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

        const breeder = application.breederId;

        return {
            applicationId: application._id.toString(),
            adopterName: application.adopterName,
            adopterEmail: application.adopterEmail,
            adopterPhone: application.adopterPhone,
            breederId: this.toReferencedId(breeder),
            breederName: this.toReferencedName(breeder, 'name', '알 수 없음'),
            petName: application.petName,
            status: application.status as ApplicationStatus,
            standardResponses: application.standardResponses || {},
            customResponses: application.customResponses || [],
            appliedAt: application.appliedAt,
            processedAt: application.processedAt,
            breederNotes: application.breederNotes,
        };
    }

    private toReferencedId(
        value?: AdopterObjectIdLike | { _id?: AdopterObjectIdLike } | null,
    ): string {
        if (!value) {
            return '';
        }

        if ('_id' in value && value._id) {
            return value._id.toString();
        }

        return value.toString();
    }

    private toReferencedName<TField extends 'name' | 'nickname'>(
        value: AdopterObjectIdLike | { _id?: AdopterObjectIdLike } | { name?: string; nickname?: string } | null | undefined,
        field: TField,
        fallback: string,
    ): string {
        if (!value || typeof value !== 'object') {
            return fallback;
        }

        if (field === 'name' && 'name' in value && typeof value.name === 'string' && value.name) {
            return value.name;
        }

        if (field === 'nickname' && 'nickname' in value && typeof value.nickname === 'string' && value.nickname) {
            return value.nickname;
        }

        return fallback;
    }
}
