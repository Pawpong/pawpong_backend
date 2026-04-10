import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { BreederSuspendRequestDto } from '../../dto/request/breeder-suspend-request.dto';
import { BreederSuspendResponseDto } from '../../dto/response/breeder-suspend-response.dto';
import { BREEDER_ADMIN_READER } from '../ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER } from '../ports/breeder-admin-writer.port';
import { BREEDER_ADMIN_NOTIFIER } from '../ports/breeder-admin-notifier.port';
import type { BreederAdminReaderPort } from '../ports/breeder-admin-reader.port';
import type { BreederAdminWriterPort } from '../ports/breeder-admin-writer.port';
import type { BreederAdminNotifierPort } from '../ports/breeder-admin-notifier.port';
import { BreederAdminActivityLogFactoryService } from '../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../domain/services/breeder-admin-policy.service';
import { BreederAdminSuspensionPresentationService } from '../../domain/services/breeder-admin-suspension-presentation.service';

@Injectable()
export class SuspendBreederUseCase {
    constructor(
        @Inject(BREEDER_ADMIN_READER)
        private readonly breederAdminReader: BreederAdminReaderPort,
        @Inject(BREEDER_ADMIN_WRITER)
        private readonly breederAdminWriter: BreederAdminWriterPort,
        @Inject(BREEDER_ADMIN_NOTIFIER)
        private readonly breederAdminNotifier: BreederAdminNotifierPort,
        private readonly breederAdminPolicyService: BreederAdminPolicyService,
        private readonly breederAdminActivityLogFactoryService: BreederAdminActivityLogFactoryService,
        private readonly breederAdminSuspensionPresentationService: BreederAdminSuspensionPresentationService,
    ) {}

    async execute(
        adminId: string,
        breederId: string,
        suspendData: BreederSuspendRequestDto,
    ): Promise<BreederSuspendResponseDto> {
        this.breederAdminPolicyService.assertCanManageBreeders(
            await this.breederAdminReader.findAdminById(adminId),
        );

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

        return this.breederAdminSuspensionPresentationService.create(
            breederId,
            suspendData.reason,
            suspendedAt,
            true,
        );
    }
}
