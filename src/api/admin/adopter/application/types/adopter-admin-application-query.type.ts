import { ApplicationStatus } from '../../../../../common/enum/user.enum';

export type AdopterAdminApplicationListQuery = {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    breederName?: string;
    startDate?: string;
    endDate?: string;
};
