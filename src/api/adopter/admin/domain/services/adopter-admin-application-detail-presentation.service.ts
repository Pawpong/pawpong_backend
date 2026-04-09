import { Injectable } from '@nestjs/common';

import {
    AdminApplicationDetailResponseDto,
    AdminCustomResponseDto,
    AdminStandardResponsesDto,
} from '../../dto/response/application-detail-response.dto';
import { AdopterAdminApplicationDetailSnapshot } from '../../application/ports/adopter-admin-reader.port';

@Injectable()
export class AdopterAdminApplicationDetailPresentationService {
    toApplicationDetail(snapshot: AdopterAdminApplicationDetailSnapshot): AdminApplicationDetailResponseDto {
        return {
            applicationId: snapshot.applicationId,
            adopterName: snapshot.adopterName,
            adopterEmail: snapshot.adopterEmail,
            adopterPhone: snapshot.adopterPhone,
            breederId: snapshot.breederId,
            breederName: snapshot.breederName,
            petName: snapshot.petName,
            status: snapshot.status,
            standardResponses: snapshot.standardResponses as AdminStandardResponsesDto,
            customResponses: snapshot.customResponses as AdminCustomResponseDto[],
            appliedAt: snapshot.appliedAt,
            processedAt: snapshot.processedAt,
            breederNotes: snapshot.breederNotes,
        };
    }
}
