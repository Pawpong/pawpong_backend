import { BreederLevel, VerificationStatus } from '../../../../../../common/enum/user.enum';

export type BreederVerificationAdminSearchQuery = {
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

export type BreederLevelChangeCommand = {
    newLevel: BreederLevel;
};
