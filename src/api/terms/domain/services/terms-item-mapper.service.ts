import { Injectable } from '@nestjs/common';

import { TermsSnapshot } from '../../application/ports/terms-reader.port';
import type { TermsItemResult } from '../../application/types/terms-result.type';

@Injectable()
export class TermsItemMapperService {
    toItem(terms: TermsSnapshot): TermsItemResult {
        return {
            termsId: terms.id,
            code: terms.code,
            version: terms.version,
            title: terms.title,
            body: terms.body,
            isRequired: terms.isRequired,
            activatedAt: terms.activatedAt ? terms.activatedAt.toISOString() : undefined,
            createdAt: terms.createdAt.toISOString(),
            updatedAt: terms.updatedAt.toISOString(),
        };
    }
}
