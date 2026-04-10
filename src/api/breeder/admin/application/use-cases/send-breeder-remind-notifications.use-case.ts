import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { BreederRemindResponseDto } from '../../dto/response/breeder-remind-response.dto';
import { BREEDER_ADMIN_READER } from '../ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER } from '../ports/breeder-admin-writer.port';
import { BREEDER_ADMIN_NOTIFIER } from '../ports/breeder-admin-notifier.port';
import type { BreederAdminReaderPort } from '../ports/breeder-admin-reader.port';
import type { BreederAdminWriterPort } from '../ports/breeder-admin-writer.port';
import type { BreederAdminNotifierPort } from '../ports/breeder-admin-notifier.port';
import { BreederAdminActivityLogFactoryService } from '../../domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from '../../domain/services/breeder-admin-policy.service';
import { BreederAdminReminderPresentationService } from '../../domain/services/breeder-admin-reminder-presentation.service';
import { BreederAdminReminderPolicyService } from '../../domain/services/breeder-admin-reminder-policy.service';
import type { BreederRemindCommand } from '../types/breeder-admin-command.type';

@Injectable()
export class SendBreederRemindNotificationsUseCase {
    constructor(
        @Inject(BREEDER_ADMIN_READER)
        private readonly breederAdminReader: BreederAdminReaderPort,
        @Inject(BREEDER_ADMIN_WRITER)
        private readonly breederAdminWriter: BreederAdminWriterPort,
        @Inject(BREEDER_ADMIN_NOTIFIER)
        private readonly breederAdminNotifier: BreederAdminNotifierPort,
        private readonly breederAdminPolicyService: BreederAdminPolicyService,
        private readonly breederAdminActivityLogFactoryService: BreederAdminActivityLogFactoryService,
        private readonly breederAdminReminderPresentationService: BreederAdminReminderPresentationService,
        private readonly breederAdminReminderPolicyService: BreederAdminReminderPolicyService,
    ) {}

    async execute(adminId: string, remindData: BreederRemindCommand): Promise<BreederRemindResponseDto> {
        this.breederAdminPolicyService.assertCanManageBreeders(
            await this.breederAdminReader.findAdminById(adminId),
        );

        const reminderPlan = this.breederAdminReminderPolicyService.resolve(remindData.remindType);
        const successIds: string[] = [];
        const failIds: string[] = [];

        for (const breederId of remindData.breederIds) {
            try {
                const breeder = await this.breederAdminReader.findBreederById(breederId);
                if (
                    !breeder ||
                    !this.breederAdminPolicyService.canSendReminder(
                        breeder,
                        reminderPlan.requiredVerificationStatus,
                    )
                ) {
                    failIds.push(breederId);
                    continue;
                }

                const breederName = this.breederAdminPolicyService.getBreederNickname(breeder);

                await this.breederAdminNotifier.sendReminder({
                    recipient: {
                        breederId,
                        breederName,
                        emailAddress: breeder.emailAddress,
                    },
                    notificationType: reminderPlan.notificationType,
                    title: reminderPlan.title,
                    content: reminderPlan.content,
                    targetUrl: reminderPlan.targetUrl,
                    emailTemplate: reminderPlan.emailTemplate,
                });

                await this.breederAdminWriter.appendAdminActivityLog(
                    adminId,
                    this.breederAdminActivityLogFactoryService.create(
                        AdminAction.REVIEW_BREEDER,
                        AdminTargetType.BREEDER,
                        breederId,
                        breederName,
                        reminderPlan.activityDescription,
                    ),
                );

                successIds.push(breederId);
            } catch (error) {
                failIds.push(breederId);
            }
        }

        return this.breederAdminReminderPresentationService.create(
            remindData.breederIds.length,
            successIds,
            failIds,
            new Date(),
        );
    }
}
