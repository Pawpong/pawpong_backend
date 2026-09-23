export type DeletionRole = 'adopter' | 'breeder';
export type DeletionStatus = 'pending' | 'processing' | 'retryable' | 'review_required' | 'completed';
export type DeletionAccount = {
    accountId: string;
    role: DeletionRole;
    provider?: string;
    providerUserId?: string;
};
export type DeletionJob = {
    requestId: string;
    receiptHash: string;
    accountId?: string;
    role?: DeletionRole;
    status: DeletionStatus;
    requestedAt: Date;
    completedAt?: Date;
    appleConnectionRemovalRequired: boolean;
    providerCompleted: boolean;
    dataErased: boolean;
    attempts: number;
    leaseToken?: string;
    plan?: DeletionPlan;
};
export type DeletionOperation = {
    collection: string;
    filter: Record<string, unknown>;
    update?: Record<string, unknown>;
    arrayFilters?: Record<string, unknown>[];
};
export type DeletionPlan = {
    account: DeletionAccount;
    operations: DeletionOperation[];
    fileCandidates: string[];
    prefixes: string[];
    generatedKeys: string[];
    affectedBreeders: string[];
    affectedPosts: string[];
    affectedVideos: string[];
    affectedEntries: string[];
    affectedContests: string[];
    affectedUsers: string[];
    affectedPets: string[];
};

export const ACCOUNT_DELETION_STORE = Symbol('ACCOUNT_DELETION_STORE');
export interface AccountDeletionStore {
    request(accountId: string, role: DeletionRole, requestId: string, receiptHash: string): Promise<DeletionJob>;
    find(requestId: string): Promise<DeletionJob | null>;
    claim(requestId: string, leaseToken: string): Promise<DeletionJob | null>;
    dueRequestIds(limit: number): Promise<string[]>;
    heartbeat(requestId: string, leaseToken: string): Promise<boolean>;
    collect(job: DeletionJob): Promise<DeletionPlan>;
    savePlan(job: DeletionJob, plan: DeletionPlan, objectKeys: string[]): Promise<void>;
    providerDone(job: DeletionJob, manual: boolean): Promise<void>;
    eraseData(job: DeletionJob): Promise<void>;
    pendingFiles(requestId: string, limit: number, includeReview?: boolean): Promise<string[]>;
    fileDeleted(requestId: string, objectKey: string): Promise<void>;
    hasOtherFileReference(account: DeletionAccount, objectKey: string): Promise<boolean>;
    requireFileReview(job: DeletionJob, objectKey: string): Promise<void>;
    reviewRequired(job: DeletionJob): Promise<void>;
    complete(job: DeletionJob): Promise<void>;
    retry(job: DeletionJob, code: string): Promise<void>;
}
export const ACCOUNT_DELETION_FILES = Symbol('ACCOUNT_DELETION_FILES');
export interface AccountDeletionFiles {
    /** 외부 URL/공통 기본 이미지는 삭제하지 않는다. */
    resolveKey(value: string): string | null;
    listPrefix(prefix: string): Promise<string[]>;
    delete(objectKey: string): Promise<void>;
}
export const ACCOUNT_DELETION_PROVIDER_REVOCATION = Symbol('ACCOUNT_DELETION_PROVIDER_REVOCATION');
export interface AccountDeletionProviderRevocation {
    revoke(account: DeletionAccount): Promise<{ status: 'revoked' | 'not_applicable' | 'manual_disconnect_required' }>;
}
