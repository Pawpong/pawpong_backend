export const BREEDER_REPORT_ADMIN_READER = Symbol('BREEDER_REPORT_ADMIN_READER');

export interface BreederReportAdminAdminSnapshot {
    id: string;
    name?: string;
    permissions?: {
        canManageBreeders?: boolean;
    };
}

export interface BreederReportAdminReportListQuery {
    status?: string;
    pageNumber: number;
    itemsPerPage: number;
}

export interface BreederReportAdminReportListItemSnapshot {
    reportId: string;
    targetId: string;
    targetName: string;
    type: string;
    description: string;
    status: string;
    reportedAt: Date;
    adminNotes?: string;
}

export interface BreederReportAdminReportListResult {
    items: BreederReportAdminReportListItemSnapshot[];
    totalCount: number;
}

export interface BreederReportAdminReportSnapshot {
    reportId: string;
    breederId: string;
    breederName: string;
    status: string;
    type: string;
    description: string;
    reportedAt: Date;
    adminNotes?: string;
}

export interface BreederReportAdminReaderPort {
    findAdminById(adminId: string): Promise<BreederReportAdminAdminSnapshot | null>;
    getReports(query: BreederReportAdminReportListQuery): Promise<BreederReportAdminReportListResult>;
    findReportById(reportId: string): Promise<BreederReportAdminReportSnapshot | null>;
}
