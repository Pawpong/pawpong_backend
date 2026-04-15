import { HttpException } from '@nestjs/common';

import { DomainError } from '../error/domain.error';

export function rethrowIfHttpException(error: unknown): void {
    if (error instanceof HttpException || error instanceof DomainError) {
        throw error;
    }
}
