import { Injectable } from '@nestjs/common';
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
import { BreederReportAdminRepository } from '../repository/breeder-report-admin.repository';

@Injectable()
export class BreederReportAdminMongooseRepositoryAdapter
    implements BreederReportAdminReaderPort, BreederReportAdminWriterPort
{
    constructor(private readonly breederReportAdminRepository: BreederReportAdminRepository) {}

    async findAdminById(adminId: string): Promise<BreederReportAdminAdminSnapshot | null> {
        const admin = await this.breederReportAdminRepository.findAdminById(adminId);

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
        const result = await this.breederReportAdminRepository.getReports(query);

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
        const breeder = await this.breederReportAdminRepository.findBreederWithReport(reportId);
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
        await this.breederReportAdminRepository.updateReport(breederId, reportId, patch);
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederReportAdminActivityLogEntry): Promise<void> {
        await this.breederReportAdminRepository.appendAdminActivityLog(adminId, logEntry);
    }
}
