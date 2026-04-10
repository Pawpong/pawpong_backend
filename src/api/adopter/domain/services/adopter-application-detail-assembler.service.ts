import { Injectable } from '@nestjs/common';

import type { AdopterApplicationRecord } from '../../application/ports/adopter-application-reader.port';
import type { AdopterApplicationDetailResult } from '../../application/types/adopter-result.type';

@Injectable()
export class AdopterApplicationDetailAssemblerService {
    toResponse(application: AdopterApplicationRecord, breeder: any | null): AdopterApplicationDetailResult {
        return {
            applicationId: application._id.toString(),
            breederId: application.breederId.toString(),
            breederName: breeder?.name || '알 수 없음',
            petId: application.petId?.toString(),
            petName: application.petName,
            status: application.status,
            standardResponses: application.standardResponses,
            customResponses: application.customResponses || [],
            appliedAt: application.appliedAt.toISOString(),
            processedAt: application.processedAt?.toISOString(),
            breederNotes: application.breederNotes,
        };
    }
}
