import { Injectable } from '@nestjs/common';

import { BreederManagementApplicationRecord } from '../../application/ports/breeder-management-application-workflow.port';

@Injectable()
export class BreederManagementApplicationDetailAssemblerService {
    toResponse(application: BreederManagementApplicationRecord) {
        return {
            applicationId: application._id.toString(),
            adopterId: application.adopterId.toString(),
            adopterName: application.adopterName,
            adopterEmail: application.adopterEmail,
            adopterPhone: application.adopterPhone,
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
