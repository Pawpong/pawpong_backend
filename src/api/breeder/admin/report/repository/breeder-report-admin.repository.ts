import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { Admin, AdminDocument } from '../../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../../schema/breeder.schema';
import { BreederReportAdminReportListQuery } from '../application/ports/breeder-report-admin-reader.port';
import {
    BreederReportAdminActivityLogEntry,
    BreederReportAdminReportPatch,
} from '../application/ports/breeder-report-admin-writer.port';
import type {
    BreederAdminAdminDocumentRecord,
    BreederAdminReportAggregateResult,
    BreederAdminReportOwnerDocumentRecord,
} from '../../types/breeder-admin-record.type';

@Injectable()
export class BreederReportAdminRepository {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    findAdminById(adminId: string): Promise<BreederAdminAdminDocumentRecord | null> {
        return this.adminModel
            .findById(adminId)
            .select('name permissions')
            .lean<BreederAdminAdminDocumentRecord>()
            .exec();
    }

    async getReports(query: BreederReportAdminReportListQuery): Promise<BreederAdminReportAggregateResult | null> {
        const skip = (query.pageNumber - 1) * query.itemsPerPage;
        const pipeline: PipelineStage[] = [{ $match: { 'reports.0': { $exists: true } } }, { $unwind: '$reports' }];

        if (query.status) {
            pipeline.push({ $match: { 'reports.status': query.status } });
        }

        pipeline.push(
            { $sort: { 'reports.reportedAt': -1 } },
            {
                $facet: {
                    items: [
                        { $skip: skip },
                        { $limit: query.itemsPerPage },
                        {
                            $project: {
                                reportId: '$reports.reportId',
                                targetId: '$_id',
                                targetName: '$nickname',
                                type: '$reports.type',
                                description: '$reports.description',
                                status: '$reports.status',
                                reportedAt: '$reports.reportedAt',
                                adminNotes: '$reports.adminNotes',
                            },
                        },
                    ],
                    totalCount: [{ $count: 'total' }],
                },
            },
        );

        const [result] = await this.breederModel.aggregate<BreederAdminReportAggregateResult>(pipeline);
        return result;
    }

    findBreederWithReport(reportId: string): Promise<BreederAdminReportOwnerDocumentRecord | null> {
        return this.breederModel
            .findOne({ 'reports.reportId': reportId })
            .select('name nickname reports')
            .lean<BreederAdminReportOwnerDocumentRecord>()
            .exec();
    }

    async updateReport(breederId: string, reportId: string, patch: BreederReportAdminReportPatch): Promise<void> {
        const $set: Record<string, unknown> = {
            'reports.$.status': patch.status,
        };
        const $unset: Record<string, ''> = {};

        if ('adminNotes' in patch) {
            if (patch.adminNotes === undefined) {
                $unset['reports.$.adminNotes'] = '';
            } else {
                $set['reports.$.adminNotes'] = patch.adminNotes;
            }
        }

        if (patch.suspensionReason !== undefined) {
            $set.accountStatus = 'suspended';
            $set.suspensionReason = patch.suspensionReason;
        }

        if (patch.suspendedAt !== undefined) {
            $set.suspendedAt = patch.suspendedAt;
        }

        const update: Record<string, Record<string, unknown>> = {};
        if (Object.keys($set).length > 0) {
            update.$set = $set;
        }
        if (Object.keys($unset).length > 0) {
            update.$unset = $unset;
        }

        await this.breederModel.updateOne({ _id: breederId, 'reports.reportId': reportId }, update);
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederReportAdminActivityLogEntry): Promise<void> {
        await this.adminModel.findByIdAndUpdate(adminId, {
            $push: {
                activityLogs: logEntry,
            },
        });
    }
}
