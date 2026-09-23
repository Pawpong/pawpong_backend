import { Global, Module } from '@nestjs/common';
import { ACCOUNT_WRITE_FENCE_STORE } from './account-write-fence.port';
import { AccountWriteFenceRepository } from './account-write-fence.repository';
import { AccountWriteFenceService } from './account-write-fence.service';

/** HTTP 전역 interceptor와 websocket 쓰기가 같은 durable 계정 쓰기 경계를 사용한다. */
@Global()
@Module({
    providers: [
        AccountWriteFenceRepository,
        AccountWriteFenceService,
        { provide: ACCOUNT_WRITE_FENCE_STORE, useExisting: AccountWriteFenceRepository },
    ],
    exports: [AccountWriteFenceService],
})
export class AccountWriteFenceModule {}
