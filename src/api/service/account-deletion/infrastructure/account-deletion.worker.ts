import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ACCOUNT_DELETION_STORE, type AccountDeletionStore } from '../application/ports/account-deletion.port';
import { ProcessAccountDeletionUseCase } from '../application/use-cases/process-account-deletion.use-case';

@Injectable()
export class AccountDeletionWorker implements OnModuleInit, OnModuleDestroy {
    private timer?: NodeJS.Timeout;
    private running = false;
    private stopped = false;
    private readonly logger = new Logger(AccountDeletionWorker.name);
    constructor(
        @Inject(ACCOUNT_DELETION_STORE) private readonly store: AccountDeletionStore,
        private readonly process: ProcessAccountDeletionUseCase,
    ) {}
    onModuleInit() {
        if (process.env.NODE_ENV === 'test' || process.env.ACCOUNT_DELETION_WORKER_DISABLED === 'true') return;
        this.timer = setInterval(() => {
            void this.tick();
        }, 30_000);
        this.timer.unref();
    }
    async tick() {
        if (this.running || this.stopped) return;
        this.running = true;
        try {
            for (const id of await this.store.dueRequestIds(2)) {
                if (this.stopped) break;
                await this.process.execute(id);
            }
        } catch {
            this.logger.warn('계정 삭제 재시도 작업을 다음 주기에 다시 확인합니다.');
        } finally {
            this.running = false;
        }
    }
    onModuleDestroy() {
        this.stopped = true;
        if (this.timer) clearInterval(this.timer);
    }
}
