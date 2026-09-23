import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
    ACCOUNT_DELETION_STORE,
    ACCOUNT_DELETION_FILES,
    ACCOUNT_DELETION_PROVIDER_REVOCATION,
    type AccountDeletionStore,
    type AccountDeletionFiles,
    type AccountDeletionProviderRevocation,
} from '../ports/account-deletion.port';

/** DB lease와 파일별 완료 표식으로 중복 실행·프로세스 재시작에도 삭제를 이어간다. */
@Injectable()
export class ProcessAccountDeletionUseCase {
    constructor(
        @Inject(ACCOUNT_DELETION_STORE) private readonly store: AccountDeletionStore,
        @Inject(ACCOUNT_DELETION_FILES) private readonly files: AccountDeletionFiles,
        @Inject(ACCOUNT_DELETION_PROVIDER_REVOCATION) private readonly provider: AccountDeletionProviderRevocation,
    ) {}

    async execute(requestId: string): Promise<boolean> {
        const job = await this.store.claim(requestId, randomUUID());
        if (!job) return false;
        const heartbeat = async () => {
            if (!(await this.store.heartbeat(job.requestId, job.leaseToken!))) throw new Error('LEASE_LOST');
        };
        try {
            if (!job.plan) {
                const plan = await this.store.collect(job);
                const keys = new Set(
                    plan.fileCandidates
                        .map((value) => this.files.resolveKey(value))
                        .filter((key): key is string => !!key),
                );
                for (const prefix of plan.prefixes) {
                    await heartbeat();
                    for (const key of await this.files.listPrefix(prefix)) keys.add(key);
                }
                await this.store.savePlan(job, plan, [...keys]);
                job.plan = plan;
            }
            if (!job.providerCompleted) {
                await heartbeat();
                const result = await this.provider.revoke(job.plan.account);
                await this.store.providerDone(job, result.status === 'manual_disconnect_required');
                job.providerCompleted = true;
            }
            if (!job.dataErased) {
                await heartbeat();
                await this.store.eraseData(job);
                job.dataErased = true;
            }
            // 1회 처리량을 제한한다. 다음 interval/CLI가 나머지 파일을 이어간다.
            for (const key of await this.store.pendingFiles(job.requestId, 100)) {
                await heartbeat();
                if (await this.store.hasOtherFileReference(job.plan.account, key)) {
                    await this.store.requireFileReview(job, key);
                    continue;
                }
                await this.files.delete(key);
                await this.store.fileDeleted(job.requestId, key);
            }
            if ((await this.store.pendingFiles(job.requestId, 1)).length) {
                await this.store.retry(job, 'FILES_REMAIN');
                return false;
            }
            if ((await this.store.pendingFiles(job.requestId, 1, true)).length) {
                await this.store.reviewRequired(job);
                return false;
            }
            await heartbeat();
            await this.store.complete(job);
            return true;
        } catch {
            // 원본 오류/파일명/토큰을 로그나 공개 상태에 노출하지 않는다.
            await this.store.retry(job, 'CLEANUP_RETRY_REQUIRED');
            return false;
        }
    }
}
