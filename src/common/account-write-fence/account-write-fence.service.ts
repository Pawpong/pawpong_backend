import { Inject, Injectable } from '@nestjs/common';
import {
    ACCOUNT_WRITE_FENCE_STORE,
    type AccountWriteActor,
    type AccountWriteFenceStore,
} from './account-write-fence.port';

@Injectable()
export class AccountWriteFenceService {
    constructor(@Inject(ACCOUNT_WRITE_FENCE_STORE) private readonly store: AccountWriteFenceStore) {}

    /** HTTP 연결 종료와 독립적으로 실제 쓰기 Promise가 settle될 때까지 lease를 유지한다. */
    async runWithLease<T>(actor: AccountWriteActor, operation: () => Promise<T>): Promise<T> {
        const lease = await this.store.acquire(actor);
        try {
            return await operation();
        } finally {
            await this.store.release(lease);
        }
    }
}
