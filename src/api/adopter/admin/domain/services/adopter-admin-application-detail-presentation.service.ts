import { Injectable } from '@nestjs/common';

import { AdopterAdminApplicationDetailSnapshot } from '../../application/ports/adopter-admin-reader.port';
import type {
    AdopterAdminApplicationDetailResult,
    AdopterAdminCustomResponseResult,
    AdopterAdminStandardResponsesResult,
} from '../../application/types/adopter-admin-result.type';

@Injectable()
export class AdopterAdminApplicationDetailPresentationService {
    toApplicationDetail(snapshot: AdopterAdminApplicationDetailSnapshot): AdopterAdminApplicationDetailResult {
        return {
            applicationId: snapshot.applicationId,
            adopterName: snapshot.adopterName,
            adopterEmail: snapshot.adopterEmail,
            adopterPhone: snapshot.adopterPhone,
            breederId: snapshot.breederId,
            breederName: snapshot.breederName,
            petName: snapshot.petName,
            status: snapshot.status,
            standardResponses: snapshot.standardResponses as AdopterAdminStandardResponsesResult,
            customResponses: snapshot.customResponses as AdopterAdminCustomResponseResult[],
            appliedAt: snapshot.appliedAt,
            processedAt: snapshot.processedAt,
            breederNotes: snapshot.breederNotes,
        };
    }
}
