import { Injectable } from '@nestjs/common';

import { Terms } from '../../../../schema/terms.schema';
import { TermsSnapshot } from '../../../service/terms/application/ports/terms-reader.port';
import { TermsRepository } from '../../../service/terms/repository/terms.repository';
import { TermsWriterPort } from '../application/ports/terms-writer.port';
import type { TermsCreateCommand, TermsUpdateCommand } from '../application/types/terms-command.type';

@Injectable()
export class TermsMongooseWriterAdapter implements TermsWriterPort {
    constructor(private readonly termsRepository: TermsRepository) {}

    async findAll(): Promise<TermsSnapshot[]> {
        const items = await this.termsRepository.findAll();
        return items.map((item) => this.toSnapshot(item));
    }

    async findById(termsId: string): Promise<TermsSnapshot | null> {
        const terms = await this.termsRepository.findById(termsId);
        return terms ? this.toSnapshot(terms) : null;
    }

    async create(createData: TermsCreateCommand): Promise<TermsSnapshot> {
        const terms = await this.termsRepository.create(createData);
        const snapshot = this.toSnapshot(terms);

        if (!createData.activate) {
            return snapshot;
        }

        const activated = await this.termsRepository.activate(snapshot.id);
        return activated ? this.toSnapshot(activated) : snapshot;
    }

    async update(termsId: string, updateData: TermsUpdateCommand): Promise<TermsSnapshot | null> {
        const terms = await this.termsRepository.update(termsId, updateData);
        return terms ? this.toSnapshot(terms) : null;
    }

    async activate(termsId: string): Promise<TermsSnapshot | null> {
        const terms = await this.termsRepository.activate(termsId);
        return terms ? this.toSnapshot(terms) : null;
    }

    async delete(termsId: string): Promise<boolean> {
        return this.termsRepository.deleteById(termsId);
    }

    private toSnapshot(terms: Terms): TermsSnapshot {
        return {
            id: terms._id.toString(),
            code: terms.code,
            version: terms.version,
            title: terms.title,
            body: terms.body,
            isRequired: terms.isRequired,
            isActive: terms.isActive,
            activatedAt: terms.activatedAt ?? null,
            createdAt: terms.createdAt,
            updatedAt: terms.updatedAt,
        };
    }
}
