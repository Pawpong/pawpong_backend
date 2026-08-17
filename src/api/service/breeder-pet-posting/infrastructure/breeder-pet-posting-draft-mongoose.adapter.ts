import { Injectable } from '@nestjs/common';

import type { BreederPetPostingDraftPort } from '../application/ports/breeder-pet-posting-draft.port';
import type {
    BreederPetPostingDraftForm,
    BreederPetPostingDraftSnapshot,
} from '../application/types/breeder-pet-posting-draft.type';
import { BreederPetPostingDraftRepository } from '../repository/breeder-pet-posting-draft.repository';
import type { BreederPetPostingDraftDocument } from '../../../../schema/breeder-pet-posting-draft.schema';

@Injectable()
export class BreederPetPostingDraftMongooseAdapter implements BreederPetPostingDraftPort {
    constructor(private readonly repository: BreederPetPostingDraftRepository) {}

    create(breederId: string, form: BreederPetPostingDraftForm): Promise<{ draftId: string }> {
        return this.repository.create(breederId, form);
    }

    updateByOwner(draftId: string, breederId: string, form: BreederPetPostingDraftForm): Promise<{ updated: boolean }> {
        return this.repository.updateByOwner(draftId, breederId, form);
    }

    async listByOwner(breederId: string): Promise<BreederPetPostingDraftSnapshot[]> {
        const docs = await this.repository.listByOwner(breederId);
        return docs.map((doc) => this.toSnapshot(doc));
    }

    async findByOwner(draftId: string, breederId: string): Promise<BreederPetPostingDraftSnapshot | null> {
        const doc = await this.repository.findByOwner(draftId, breederId);
        return doc ? this.toSnapshot(doc) : null;
    }

    deleteByOwner(draftId: string, breederId: string): Promise<{ deleted: boolean }> {
        return this.repository.deleteByOwner(draftId, breederId);
    }

    countByOwner(breederId: string): Promise<number> {
        return this.repository.countByOwner(breederId);
    }

    private toSnapshot(doc: BreederPetPostingDraftDocument): BreederPetPostingDraftSnapshot {
        return {
            draftId: String(doc._id),
            breederId: String(doc.breederId),
            form: doc.form ?? {},
            updatedAt: doc.updatedAt,
        };
    }
}
