import { StatsType } from '../../../../../common/enum/user.enum';

export type PlatformStatsQuery = {
    statsType?: StatsType;
    startDate?: string;
    endDate?: string;
    pageNumber?: number;
    itemsPerPage?: number;
};
