import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from '../../../common/storage/storage.module';
import { AppleCredentialsModule } from '../auth/apple-credentials/apple-credentials.module';
import { AppleCredentialService } from '../auth/apple-credentials/application/apple-credential.service';
import {
    ACCOUNT_DELETION_FILES,
    ACCOUNT_DELETION_PROVIDER_REVOCATION,
    ACCOUNT_DELETION_STORE,
} from './application/ports/account-deletion.port';
import {
    RequestAccountDeletionUseCase,
    GetAccountDeletionStatusUseCase,
} from './application/use-cases/request-account-deletion.use-case';
import { ProcessAccountDeletionUseCase } from './application/use-cases/process-account-deletion.use-case';
import { AccountDeletionController } from './controller/account-deletion.controller';
import { AccountDeletionRepository } from './repository/account-deletion.repository';
import { AccountDeletionFilesAdapter } from './infrastructure/account-deletion-files.adapter';
import { AccountDeletionDraftStore } from './infrastructure/account-deletion-draft.store';
import { AccountDeletionWorker } from './infrastructure/account-deletion.worker';

@Module({
    imports: [ConfigModule, StorageModule, AppleCredentialsModule],
    controllers: [AccountDeletionController],
    providers: [
        AccountDeletionRepository,
        AccountDeletionFilesAdapter,
        AccountDeletionDraftStore,
        AccountDeletionWorker,
        RequestAccountDeletionUseCase,
        GetAccountDeletionStatusUseCase,
        ProcessAccountDeletionUseCase,
        { provide: ACCOUNT_DELETION_STORE, useExisting: AccountDeletionRepository },
        { provide: ACCOUNT_DELETION_FILES, useExisting: AccountDeletionFilesAdapter },
        { provide: ACCOUNT_DELETION_PROVIDER_REVOCATION, useExisting: AppleCredentialService },
    ],
    exports: [ProcessAccountDeletionUseCase, AccountDeletionRepository],
})
export class AccountDeletionModule {}
