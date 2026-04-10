import { Inject, Injectable } from '@nestjs/common';

import { AdminTargetType } from '../../../../../common/enum/user.enum';
import { BREEDER_ADMIN_READER } from '../ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER } from '../ports/breeder-admin-writer.port';
import type { BreederAdminReaderPort } from '../ports/breeder-admin-reader.port';
import type { BreederAdminWriterPort } from '../ports/breeder-admin-writer.port';
import { BreederAdminActivityLogFactoryService } from '../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../domain/services/breeder-admin-policy.service';
import { BreederAdminTestAccountPresentationService } from '../../domain/services/breeder-admin-test-account-presentation.service';
import type { BreederAdminTestAccountResult } from '../types/breeder-admin-result.type';

@Injectable()
export class SetBreederTestAccountUseCase {
    constructor(
        @Inject(BREEDER_ADMIN_READER)
        private readonly breederAdminReader: BreederAdminReaderPort,
        @Inject(BREEDER_ADMIN_WRITER)
        private readonly breederAdminWriter: BreederAdminWriterPort,
        private readonly breederAdminPolicyService: BreederAdminPolicyService,
        private readonly breederAdminActivityLogFactoryService: BreederAdminActivityLogFactoryService,
        private readonly breederAdminTestAccountPresentationService: BreederAdminTestAccountPresentationService,
    ) {}

    async execute(adminId: string, breederId: string, isTestAccount: boolean): Promise<BreederAdminTestAccountResult> {
        this.breederAdminPolicyService.assertCanManageBreeders(
            await this.breederAdminReader.findAdminById(adminId),
        );

        const breeder = this.breederAdminPolicyService.assertBreederExists(
            await this.breederAdminReader.findBreederById(breederId),
        );

        await this.breederAdminWriter.updateBreeder(breederId, { isTestAccount });

        await this.breederAdminWriter.appendAdminActivityLog(
            adminId,
            this.breederAdminActivityLogFactoryService.create(
                'set_test_account',
                AdminTargetType.BREEDER,
                breederId,
                this.breederAdminPolicyService.getBreederBusinessName(breeder),
                isTestAccount
                    ? 'Set as test account (hidden from explore)'
                    : 'Removed from test account (visible in explore)',
            ),
        );

        return this.breederAdminTestAccountPresentationService.create(
            breederId,
            this.breederAdminPolicyService.getBreederBusinessName(breeder),
            isTestAccount,
            new Date(),
        );
    }
}
