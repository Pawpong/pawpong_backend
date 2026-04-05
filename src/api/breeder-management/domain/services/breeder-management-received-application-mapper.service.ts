import { Injectable } from '@nestjs/common';

import type { BreederManagementReceivedApplicationRecord } from '../../application/ports/breeder-management-list-reader.port';

@Injectable()
export class BreederManagementReceivedApplicationMapperService {
    toItem(application: BreederManagementReceivedApplicationRecord) {
        const adopterInfo = application.adopterId as { nickname?: string } | string | undefined;
        const adopterNickname =
            typeof adopterInfo === 'object' && adopterInfo !== null
                ? adopterInfo.nickname || application.adopterName || '알 수 없음'
                : application.adopterName || '알 수 없음';

        return {
            ...application,
            applicationId: String(application._id),
            adopterNickname,
            preferredPetInfo: application.standardResponses?.preferredPetDescription || null,
        };
    }
}
