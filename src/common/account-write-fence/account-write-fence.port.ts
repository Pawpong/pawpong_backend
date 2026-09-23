export type AccountWriteRole = 'adopter' | 'breeder';
export type AccountWriteActor = { accountId: string; role: AccountWriteRole; operation: string };
export type AccountWriteLease = AccountWriteActor & { leaseId: string; ownerId: string; startedAt: Date };

export const ACCOUNT_WRITE_FENCE_STORE = Symbol('ACCOUNT_WRITE_FENCE_STORE');
export interface AccountWriteFenceStore {
    acquire(actor: AccountWriteActor): Promise<AccountWriteLease>;
    release(lease: AccountWriteLease): Promise<void>;
}
