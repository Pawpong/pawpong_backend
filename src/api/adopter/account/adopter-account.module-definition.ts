import { DiscordWebhookModule } from '../../../common/discord/discord-webhook.module';

import { AdopterSharedModule } from '../shared/adopter-shared.module';
import { AdopterReportController } from '../controller/adopter-report.controller';
import { AdopterAccountController } from '../controller/adopter-account.controller';
import { CreateAdopterReportUseCase } from '../application/use-cases/create-adopter-report.use-case';
import { DeleteAdopterAccountUseCase } from '../application/use-cases/delete-adopter-account.use-case';
import { AdopterReportPayloadBuilderService } from '../domain/services/adopter-report-payload-builder.service';
import { AdopterReportCommandAdapter } from '../infrastructure/adopter-report-command.adapter';
import { AdopterAccountCommandAdapter } from '../infrastructure/adopter-account-command.adapter';
import { ADOPTER_REPORT_COMMAND_PORT } from '../application/ports/adopter-report-command.port';
import { ADOPTER_ACCOUNT_COMMAND_PORT } from '../application/ports/adopter-account-command.port';

// 입양자 > 신고·회원 탈퇴 슬라이스 (둘 다 Discord 운영 알림을 동반하는 단발 커맨드)
export const ADOPTER_ACCOUNT_MODULE_IMPORTS = [AdopterSharedModule, DiscordWebhookModule];

export const ADOPTER_ACCOUNT_MODULE_CONTROLLERS = [AdopterReportController, AdopterAccountController];

export const ADOPTER_ACCOUNT_MODULE_PROVIDERS = [
    CreateAdopterReportUseCase,
    DeleteAdopterAccountUseCase,
    AdopterReportPayloadBuilderService,
    AdopterReportCommandAdapter,
    AdopterAccountCommandAdapter,
    {
        provide: ADOPTER_REPORT_COMMAND_PORT,
        useExisting: AdopterReportCommandAdapter,
    },
    {
        provide: ADOPTER_ACCOUNT_COMMAND_PORT,
        useExisting: AdopterAccountCommandAdapter,
    },
];
