import { Inject, Injectable } from '@nestjs/common';

import { BreederLevel } from '../../../../../../common/enum/user.enum';
import { BREEDER_VERIFICATION_ADMIN_READER } from '../ports/breeder-verification-admin-reader.port';
import { BREEDER_VERIFICATION_ADMIN_WRITER } from '../ports/breeder-verification-admin-writer.port';
import type { BreederVerificationAdminReaderPort } from '../ports/breeder-verification-admin-reader.port';
import type { BreederVerificationAdminWriterPort } from '../ports/breeder-verification-admin-writer.port';
import { BreederVerificationAdminCommandResponseService } from '../../domain/services/breeder-verification-admin-command-response.service';
import { BreederVerificationAdminPolicyService } from '../../domain/services/breeder-verification-admin-policy.service';
import type { BreederLevelChangeCommand } from '../types/breeder-verification-admin-command.type';

@Injectable()
export class ChangeBreederLevelUseCase {
    constructor(
        @Inject(BREEDER_VERIFICATION_ADMIN_READER)
        private readonly breederVerificationAdminReader: BreederVerificationAdminReaderPort,
        @Inject(BREEDER_VERIFICATION_ADMIN_WRITER)
        private readonly breederVerificationAdminWriter: BreederVerificationAdminWriterPort,
        private readonly breederVerificationAdminPolicyService: BreederVerificationAdminPolicyService,
        private readonly breederVerificationAdminCommandResponseService: BreederVerificationAdminCommandResponseService,
    ) {}

    async execute(adminId: string, breederId: string, levelData: BreederLevelChangeCommand) {
        const admin = this.breederVerificationAdminPolicyService.assertCanManageBreeders(
            await this.breederVerificationAdminReader.findAdminById(adminId),
            'Access denied',
        );

        const breeder = this.breederVerificationAdminPolicyService.assertBreederExists(
            await this.breederVerificationAdminReader.findBreederById(breederId),
        );

        const changedAt = new Date();
        const previousLevel = breeder.verification?.level || BreederLevel.NEW;

        await this.breederVerificationAdminWriter.updateBreederLevel(breederId, levelData.newLevel);

        return this.breederVerificationAdminCommandResponseService.toLevelChangeResponse(
            breeder,
            previousLevel,
            levelData.newLevel,
            changedAt,
            admin.name,
        );
    }
}
