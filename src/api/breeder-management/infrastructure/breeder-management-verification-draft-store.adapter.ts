import { Injectable } from '@nestjs/common';

import {
    type BreederManagementVerificationDraftStorePort,
    type BreederManagementVerificationDraftDocument,
} from '../application/ports/breeder-management-verification-draft-store.port';

@Injectable()
export class BreederManagementVerificationDraftStoreAdapter implements BreederManagementVerificationDraftStorePort {
    private readonly drafts = new Map<string, BreederManagementVerificationDraftDocument[]>();

    async save(userId: string, documents: BreederManagementVerificationDraftDocument[]): Promise<void> {
        this.drafts.set(userId, [...documents]);
    }

    async get(userId: string): Promise<BreederManagementVerificationDraftDocument[]> {
        return [...(this.drafts.get(userId) || [])];
    }

    async delete(userId: string): Promise<void> {
        this.drafts.delete(userId);
    }
}
