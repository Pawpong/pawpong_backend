import type { PageResult } from '../../../../../../common/types/page-result.type';

export type BreederReportAdminListItemResult = {
    reportId: string;
    targetId: string;
    targetName: string;
    type: string;
    description: string;
    status: string;
    reportedAt: Date;
    adminNotes?: string;
};

export type BreederReportAdminPageResult = PageResult<BreederReportAdminListItemResult>;

export type BreederReportAdminActionResult = {
    reportId: string;
    breederId: string;
    action: string;
    status: string;
    adminNotes?: string;
    processedAt: Date;
};
