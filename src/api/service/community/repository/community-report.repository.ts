import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CommunityPostReport,
    CommunityPostReportDocument,
    type CommunityReportStatus,
} from '../../../../schema/community-post-report.schema';
import type {
    CommunityReportAdminItem,
    CommunityReportAdminListResult,
    CommunityReportAdminUpdateData,
    CommunityReportCreateData,
} from '../application/types/community-report.type';

@Injectable()
export class CommunityReportRepository {
    constructor(
        @InjectModel(CommunityPostReport.name)
        private readonly reportModel: Model<CommunityPostReportDocument>,
    ) {}

    async report(data: CommunityReportCreateData): Promise<{ alreadyReported: boolean }> {
        if (!Types.ObjectId.isValid(data.postId) || !Types.ObjectId.isValid(data.reporterId)) {
            return { alreadyReported: false };
        }

        const existing = await this.reportModel.exists({
            postId: new Types.ObjectId(data.postId),
            reporterId: new Types.ObjectId(data.reporterId),
        });
        if (existing) return { alreadyReported: true };

        await this.reportModel.create({
            postId: new Types.ObjectId(data.postId),
            reporterId: new Types.ObjectId(data.reporterId),
            reporterModel: data.reporterModel,
            reporterNickname: data.reporterNickname,
            reason: data.reason,
            description: data.description,
        });

        return { alreadyReported: false };
    }

    async findReports(query: {
        skip: number;
        limit: number;
        status?: CommunityReportStatus;
    }): Promise<CommunityReportAdminListResult> {
        const filter = query.status ? { status: query.status } : {};

        const [docs, totalItems] = await Promise.all([
            this.reportModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(query.skip)
                .limit(query.limit)
                .lean<CommunityPostReportDocument[]>()
                .exec(),
            this.reportModel.countDocuments(filter).exec(),
        ]);

        return {
            items: docs.map((d) => this.toAdminItem(d)),
            totalItems,
        };
    }

    async findReportById(reportId: string): Promise<CommunityReportAdminItem | null> {
        if (!Types.ObjectId.isValid(reportId)) return null;
        const doc = await this.reportModel.findById(reportId).lean<CommunityPostReportDocument>().exec();
        return doc ? this.toAdminItem(doc) : null;
    }

    async updateReportStatus(reportId: string, data: CommunityReportAdminUpdateData): Promise<void> {
        await this.reportModel.updateOne(
            { _id: new Types.ObjectId(reportId) },
            {
                $set: {
                    status: data.status,
                    resolvedByAdminId: new Types.ObjectId(data.resolvedByAdminId),
                    resolvedAt: data.resolvedAt,
                },
            },
        );
    }

    async hidePost(postId: string): Promise<void> {
        await this.reportModel.db
            .collection('community_posts')
            .updateOne({ _id: new Types.ObjectId(postId) }, { $set: { isActive: false } });
    }

    private toAdminItem(doc: CommunityPostReportDocument): CommunityReportAdminItem {
        return {
            reportId: String(doc._id),
            postId: String(doc.postId),
            reporterId: String(doc.reporterId),
            reporterNickname: doc.reporterNickname,
            reason: doc.reason,
            description: doc.description,
            status: doc.status,
            createdAt: doc.createdAt.toISOString(),
        };
    }
}
