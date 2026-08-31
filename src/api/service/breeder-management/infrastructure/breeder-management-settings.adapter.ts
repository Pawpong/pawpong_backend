import { Injectable } from '@nestjs/common';

import { BreederRepository } from '../repository/breeder.repository';
import type {
    BreederManagementSettingsPort,
    BreederManagementLevelChangeRequestRecord,
    BreederManagementVerificationRecord,
} from '../application/ports/breeder-management-settings.port';
import type {
    BreederManagementApplicationFormRecord,
    BreederManagementBreederRecord,
} from '../application/ports/breeder-management-profile.port';

@Injectable()
export class BreederManagementSettingsAdapter implements BreederManagementSettingsPort {
    constructor(private readonly breederRepository: BreederRepository) {}

    updateVerification(breederId: string, verification: BreederManagementVerificationRecord): Promise<void> {
        return this.breederRepository.updateVerification(breederId, verification);
    }

    requestLevelChange(breederId: string, request: BreederManagementLevelChangeRequestRecord): Promise<void> {
        return this.breederRepository.requestLevelChange(breederId, request);
    }

    updateApplicationForm(
        breederId: string,
        applicationForm: BreederManagementApplicationFormRecord[],
    ): Promise<BreederManagementBreederRecord | null> {
        return this.breederRepository.updateApplicationForm(breederId, applicationForm);
    }
}
