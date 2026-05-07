import { Injectable } from '@nestjs/common';

import { Terms, TermsCode } from '../../../schema/terms.schema';
import { TermsReaderPort, TermsSnapshot } from '../application/ports/terms-reader.port';
import { TermsRepository } from '../repository/terms.repository';

@Injectable()
export class TermsMongooseReaderAdapter implements TermsReaderPort {
    constructor(private readonly termsRepository: TermsRepository) {}

    async readActiveAll(): Promise<TermsSnapshot[]> {
        const items = await this.termsRepository.findActiveAll();
        return items.map((item) => this.toSnapshot(item));
    }

    async readActiveByCode(code: TermsCode): Promise<TermsSnapshot | null> {
        const item = await this.termsRepository.findActiveByCode(code);
        return item ? this.toSnapshot(item) : null;
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
