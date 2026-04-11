import { HttpException } from '@nestjs/common';

export function rethrowIfHttpException(error: unknown): void {
    if (error instanceof HttpException) {
        throw error;
    }
}
