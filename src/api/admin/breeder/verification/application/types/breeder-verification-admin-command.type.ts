import { VerificationStatus } from '../../../../../../common/enum/user.enum';

export type BreederVerificationAdminSearchQuery = {
    accountType?: 'all' | 'normal' | 'test';
    verificationStatus?: VerificationStatus;
    cityName?: string;
    searchKeyword?: string;
    pageNumber?: number;
    itemsPerPage?: number;
};

export type BreederVerificationUpdateCommand = {
    verificationStatus: VerificationStatus;
    rejectionReason?: string;
};
