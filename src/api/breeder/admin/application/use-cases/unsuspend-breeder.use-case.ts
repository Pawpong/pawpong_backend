import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { BreederSuspendResponseDto } from '../../dto/response/breeder-suspend-response.dto';
import { BREEDER_ADMIN_READER } from '../ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER } from '../ports/breeder-admin-writer.port';
import { BREEDER_ADMIN_NOTIFIER } from '../ports/breeder-admin-notifier.port';
import type { BreederAdminReaderPort } from '../ports/breeder-admin-reader.port';
import type { BreederAdminWriterPort } from '../ports/breeder-admin-writer.port';
import type { BreederAdminNotifierPort } from '../ports/breeder-admin-notifier.port';
import { BreederAdminActivityLogFactoryService } from '../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../domain/services/breeder-admin-policy.service';
import { BreederAdminPresentationService } from '../../domain/services/breeder-admin-presentation.service';

@Injectable()
export class UnsuspendBreederUseCase {
    constructor(
        @Inject(BREEDER_ADMIN_READER)
        private readonly breederAdminReader: BreederAdminReaderPort,
        @Inject(BREEDER_ADMIN_WRITER)
        private readonly breederAdminWriter: BreederAdminWriterPort,
        @Inject(BREEDER_ADMIN_NOTIFIER)
        private readonly breederAdminNotifier: BreederAdminNotifierPort,
        private readonly breederAdminPolicyService: BreederAdminPolicyService,
        private readonly breederAdminActivityLogFactoryService: BreederAdminActivityLogFactoryService,
        private readonly breederAdminPresentationService: BreederAdminPresentationService,
    ) {}

    async execute(adminId: string, breederId: string): Promise<BreederSuspendResponseDto> {
        this.breederAdminPolicyService.assertCanManageBreeders(
            await this.breederAdminReader.findAdminById(adminId),
        );

        const breeder = this.breederAdminPolicyService.assertUnsuspendable(
            this.breederAdminPolicyService.assertBreederExists(
                await this.breederAdminReader.findBreederById(breederId),
            ),
        );

        await this.breederAdminWriter.updateBreeder(breederId, {
            accountStatus: 'active',
            suspensionReason: undefined,
            suspendedAt: undefined,
        });

        await this.breederAdminWriter.appendAdminActivityLog(
            adminId,
            this.breederAdminActivityLogFactoryService.create(
                AdminAction.ACTIVATE_USER,
                AdminTargetType.BREEDER,
                breederId,
                this.breederAdminPolicyService.getBreederNickname(breeder),
                'Account unsuspended',
            ),
        );

        await this.breederAdminNotifier.sendUnsuspensionEmail({
            breederId,
            breederName: this.breederAdminPolicyService.getBreederNickname(breeder),
            emailAddress: breeder.emailAddress,
        });

        return this.breederAdminPresentationService.createSuspensionResponse(
            breederId,
            undefined,
            undefined,
            true,
        );
    }
}
