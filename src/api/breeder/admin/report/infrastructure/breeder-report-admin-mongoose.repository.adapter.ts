import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../../schema/breeder.schema';
import {
    BreederReportAdminAdminSnapshot,
    BreederReportAdminReaderPort,
    BreederReportAdminReportListQuery,
    BreederReportAdminReportListResult,
    BreederReportAdminReportSnapshot,
} from '../application/ports/breeder-report-admin-reader.port';
import {
    BreederReportAdminActivityLogEntry,
    BreederReportAdminReportPatch,
    BreederReportAdminWriterPort,
} from '../application/ports/breeder-report-admin-writer.port';

@Injectable()
export class BreederReportAdminMongooseRepositoryAdapter
    implements BreederReportAdminReaderPort, BreederReportAdminWriterPort
{
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async findAdminById(adminId: string): Promise<BreederReportAdminAdminSnapshot | null> {
        const admin = await this.adminModel.findById(adminId).select('name permissions').lean();

        if (!admin) {
            return null;
        }

        return {
            id: admin._id.toString(),
            name: admin.name,
            permissions: admin.permissions,
        };
    }

    async getReports(query: BreederReportAdminReportListQuery): Promise<BreederReportAdminReportListResult> {
        const skip = (query.pageNumber - 1) * query.itemsPerPage;
        const pipeline: any[] = [{ $match: { 'reports.0': { $exists: true } } }, { $unwind: '$reports' }];

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

        const [result] = await this.breederModel.aggregate(pipeline);

        return {
            items: (result?.items || []).map((item: any) => ({
                reportId: item.reportId,
                targetId: item.targetId?.toString() || '',
                targetName: item.targetName,
                type: item.type,
                description: item.description,
                status: item.status,
                reportedAt: item.reportedAt,
                adminNotes: item.adminNotes,
            })),
            totalCount: result?.totalCount?.[0]?.total || 0,
        };
    }

    async findReportById(reportId: string): Promise<BreederReportAdminReportSnapshot | null> {
        const breeder = await this.breederModel.findOne({ 'reports.reportId': reportId }).select('name nickname reports').lean();
        const report = breeder?.reports?.find((item: any) => item.reportId === reportId);

        if (!breeder || !report) {
            return null;
        }

        return {
            reportId: report.reportId,
            breederId: breeder._id.toString(),
            breederName: breeder.nickname || breeder.name,
            status: report.status,
            type: report.type,
            description: report.description,
            reportedAt: report.reportedAt,
            adminNotes: report.adminNotes,
        };
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
