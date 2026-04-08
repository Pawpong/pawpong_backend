import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import { BREEDER_MANAGEMENT_SETTINGS_PORT } from '../ports/breeder-management-settings.port';
import type { BreederManagementSettingsPort } from '../ports/breeder-management-settings.port';
import { BreederManagementCommandResponseFactoryService } from '../../domain/services/breeder-management-command-response-factory.service';
import { BreederManagementSimpleApplicationFormBuilderService } from '../../domain/services/breeder-management-simple-application-form-builder.service';

@Injectable()
export class UpdateBreederManagementSimpleApplicationFormUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_SETTINGS_PORT)
        private readonly breederManagementSettingsPort: BreederManagementSettingsPort,
        private readonly breederManagementSimpleApplicationFormBuilderService: BreederManagementSimpleApplicationFormBuilderService,
        private readonly breederManagementCommandResponseFactoryService: BreederManagementCommandResponseFactoryService,
    ) {}

    async execute(breederId: string, questions: Array<{ question: string }>) {
        const breeder = await this.breederManagementProfilePort.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더 정보를 찾을 수 없습니다.');
        }

        const customQuestions = this.breederManagementSimpleApplicationFormBuilderService.build(questions);
        const updatedBreeder = await this.breederManagementSettingsPort.updateApplicationForm(breederId, customQuestions);
        const persistedQuestions = updatedBreeder?.applicationForm ?? customQuestions;

        return this.breederManagementCommandResponseFactoryService.createSimpleApplicationFormUpdated(
            persistedQuestions,
        );
    }
}
