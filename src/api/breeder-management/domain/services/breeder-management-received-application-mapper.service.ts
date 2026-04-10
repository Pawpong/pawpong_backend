import { Injectable } from '@nestjs/common';

import type { BreederManagementReceivedApplicationRecord } from '../../application/ports/breeder-management-list-reader.port';
import type { BreederManagementReceivedApplicationResult } from '../../application/types/breeder-management-result.type';

@Injectable()
export class BreederManagementReceivedApplicationMapperService {
    toItem(application: BreederManagementReceivedApplicationRecord): BreederManagementReceivedApplicationResult {
        const adopterInfo = application.adopterId as { nickname?: string } | string | undefined;
        const adopterNickname =
            typeof adopterInfo === 'object' && adopterInfo !== null
                ? adopterInfo.nickname || application.adopterName || '알 수 없음'
                : application.adopterName || '알 수 없음';
        const petId =
            application.petId === undefined || application.petId === null ? undefined : String(application.petId);
        const processedAt = this.toDateLike(application.processedAt);
        const appliedAt = this.toDateLike(application.appliedAt) ?? new Date(0);

        return {
            applicationId: String(application._id),
            adopterId:
                typeof adopterInfo === 'object' && adopterInfo !== null && '_id' in adopterInfo && adopterInfo._id
                    ? String(adopterInfo._id)
                    : typeof adopterInfo === 'string'
                      ? adopterInfo
                      : '',
            adopterName: application.adopterName || adopterNickname,
            adopterNickname,
            adopterEmail: typeof application.adopterEmail === 'string' ? application.adopterEmail : '',
            adopterPhone: typeof application.adopterPhone === 'string' ? application.adopterPhone : '',
            petId,
            petName: typeof application.petName === 'string' ? application.petName : undefined,
            status: typeof application.status === 'string' ? application.status : '',
            applicationData: application.standardResponses,
            preferredPetInfo: application.standardResponses?.preferredPetDescription || null,
            additionalMessage: typeof application.additionalNotes === 'string' ? application.additionalNotes : undefined,
            appliedAt,
            processedAt: processedAt ?? undefined,
            breederNotes: typeof application.breederNotes === 'string' ? application.breederNotes : undefined,
        };
    }

    private toDateLike(value: unknown): Date | string | null {
        if (value instanceof Date || typeof value === 'string') {
            return value;
        }

        return null;
    }
}
