import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ApplicationFormUpdateRequestDto } from '../../dto/request/application-form-update-request.dto';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../ports/breeder-management-settings.port';
import type { BreederManagementSettingsPort } from '../ports/breeder-management-settings.port';
import { BreederManagementApplicationCommandResponseService } from '../../domain/services/breeder-management-application-command-response.service';
import { BreederManagementApplicationFormValidatorService } from '../../domain/services/breeder-management-application-form-validator.service';

@Injectable()
export class UpdateBreederManagementApplicationFormUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_SETTINGS_PORT)
        private readonly breederManagementSettingsPort: BreederManagementSettingsPort,
        private readonly breederManagementApplicationFormValidatorService: BreederManagementApplicationFormValidatorService,
        private readonly breederManagementApplicationCommandResponseService: BreederManagementApplicationCommandResponseService,
    ) {}

    async execute(breederId: string, updateDto: ApplicationFormUpdateRequestDto) {
        const breeder = await this.breederManagementProfilePort.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        this.breederManagementApplicationFormValidatorService.validateCustomQuestions(updateDto, [
            'privacyConsent',
            'selfIntroduction',
            'familyMembers',
            'allFamilyConsent',
            'allergyTestInfo',
            'timeAwayFromHome',
            'livingSpaceDescription',
            'previousPetExperience',
            'canProvideBasicCare',
            'canAffordMedicalExpenses',
            'preferredPetDescription',
            'desiredAdoptionTiming',
            'additionalNotes',
        ]);

        const customQuestions = this.breederManagementApplicationFormValidatorService.toStoredQuestions(updateDto);
        const updatedBreeder = await this.breederManagementSettingsPort.updateApplicationForm(breederId, customQuestions);

        return this.breederManagementApplicationCommandResponseService.createApplicationFormUpdated(
            updatedBreeder?.applicationForm ?? customQuestions,
        );
    }
}
