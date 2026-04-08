import { Injectable } from '@nestjs/common';

import { ReceivedApplicationResponseDto } from '../../../breeder/dto/response/received-application-response.dto';
import type { BreederManagementReceivedApplicationRecord } from '../../application/ports/breeder-management-list-reader.port';

@Injectable()
export class BreederManagementReceivedApplicationMapperService {
    toItem(application: BreederManagementReceivedApplicationRecord): ReceivedApplicationResponseDto {
        const adopterInfo = application.adopterId as { nickname?: string } | string | undefined;
        const adopterNickname =
            typeof adopterInfo === 'object' && adopterInfo !== null
                ? adopterInfo.nickname || application.adopterName || '알 수 없음'
                : application.adopterName || '알 수 없음';

        const response = application as unknown as ReceivedApplicationResponseDto;

        return {
            ...response,
            applicationId: String(application._id),
            adopterNickname,
            preferredPetInfo: application.standardResponses?.preferredPetDescription || null,
        };
    }
}
