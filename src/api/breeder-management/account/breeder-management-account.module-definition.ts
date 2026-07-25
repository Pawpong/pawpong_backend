import { DiscordWebhookModule } from '../../../common/discord/discord-webhook.module';

import { BreederManagementSharedModule } from '../shared/breeder-management-shared.module';
import { BreederManagementAccountController } from '../controller/breeder-management-account.controller';
import { DeleteBreederManagementAccountUseCase } from '../application/use-cases/delete-breeder-management-account.use-case';
import { BreederManagementAccountCommandResultMapperService } from '../domain/services/breeder-management-account-command-result-mapper.service';
import { BreederManagementAccountCommandAdapter } from '../infrastructure/breeder-management-account-command.adapter';
import { BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT } from '../application/ports/breeder-management-account-command.port';

// 브리더 관리 > 회원 탈퇴 슬라이스
// 코어 repo(Breeder/AdoptionApplication/AvailablePet)는 shared 에서, Discord 알림은 DiscordWebhookModule 에서 주입.
export const BREEDER_MANAGEMENT_ACCOUNT_MODULE_IMPORTS = [BreederManagementSharedModule, DiscordWebhookModule];

export const BREEDER_MANAGEMENT_ACCOUNT_MODULE_CONTROLLERS = [BreederManagementAccountController];

export const BREEDER_MANAGEMENT_ACCOUNT_MODULE_PROVIDERS = [
    DeleteBreederManagementAccountUseCase,
    BreederManagementAccountCommandResultMapperService,
    BreederManagementAccountCommandAdapter,
    {
        provide: BREEDER_MANAGEMENT_ACCOUNT_COMMAND_PORT,
        useExisting: BreederManagementAccountCommandAdapter,
    },
];
