export type BreederReportListQuery = {
    status?: string;
    pageNumber?: number;
    itemsPerPage?: number;
};

export type BreederReportActionCommand = {
    action: 'resolve' | 'reject';
    adminNotes?: string;
};
