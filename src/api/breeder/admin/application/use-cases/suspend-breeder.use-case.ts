import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { BREEDER_ADMIN_READER_PORT } from '../ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER_PORT } from '../ports/breeder-admin-writer.port';
import { BREEDER_ADMIN_NOTIFIER_PORT } from '../ports/breeder-admin-notifier.port';
import type { BreederAdminReaderPort } from '../ports/breeder-admin-reader.port';
import type { BreederAdminWriterPort } from '../ports/breeder-admin-writer.port';
import type { BreederAdminNotifierPort } from '../ports/breeder-admin-notifier.port';
import { BreederAdminActivityLogFactoryService } from '../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../domain/services/breeder-admin-policy.service';
import { BreederAdminSuspensionResultMapperService } from '../../domain/services/breeder-admin-suspension-result-mapper.service';
import type { BreederSuspendCommand } from '../types/breeder-admin-command.type';
import type { BreederAdminSuspensionResult } from '../types/breeder-admin-result.type';

@Injectable()
export class SuspendBreederUseCase {
    constructor(
        @Inject(BREEDER_ADMIN_READER_PORT)
        private readonly breederAdminReader: BreederAdminReaderPort,
        @Inject(BREEDER_ADMIN_WRITER_PORT)
        private readonly breederAdminWriter: BreederAdminWriterPort,
        @Inject(BREEDER_ADMIN_NOTIFIER_PORT)
        private readonly breederAdminNotifier: BreederAdminNotifierPort,
        private readonly breederAdminPolicyService: BreederAdminPolicyService,
        private readonly breederAdminActivityLogFactoryService: BreederAdminActivityLogFactoryService,
        private readonly breederAdminSuspensionResultMapperService: BreederAdminSuspensionResultMapperService,
    ) {}

    async execute(
        adminId: string,
        breederId: string,
        suspendData: BreederSuspendCommand,
    ): Promise<BreederAdminSuspensionResult> {
        this.breederAdminPolicyService.assertCanManageBreeders(await this.breederAdminReader.findAdminById(adminId));

        const breeder = this.breederAdminPolicyService.assertSuspendable(
            this.breederAdminPolicyService.assertBreederExists(
                await this.breederAdminReader.findBreederById(breederId),
            ),
        );

        const suspendedAt = new Date();

        await this.breederAdminWriter.updateBreeder(breederId, {
            accountStatus: 'suspended',
            suspensionReason: suspendData.reason,
            suspendedAt,
        });

        await this.breederAdminWriter.appendAdminActivityLog(
            adminId,
            this.breederAdminActivityLogFactoryService.create(
                AdminAction.SUSPEND_USER,
                AdminTargetType.BREEDER,
                breederId,
                this.breederAdminPolicyService.getBreederNickname(breeder),
                `Suspended: ${suspendData.reason}`,
            ),
        );

        await this.breederAdminNotifier.sendSuspensionEmail(
            {
                breederId,
                breederName: this.breederAdminPolicyService.getBreederNickname(breeder),
                emailAddress: breeder.emailAddress,
            },
            suspendData.reason,
        );

        return this.breederAdminSuspensionResultMapperService.toResult(
            breederId,
            suspendData.reason,
            suspendedAt,
            true,
        );
    }
}
