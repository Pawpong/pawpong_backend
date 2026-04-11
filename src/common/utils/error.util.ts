type ErrorLike = {
    message?: unknown;
    stack?: unknown;
    code?: unknown;
    name?: unknown;
    $metadata?: unknown;
};

function asErrorLike(error: unknown): ErrorLike | null {
    if (typeof error === 'object' && error !== null) {
        return error as ErrorLike;
    }

    return null;
}

export function getErrorMessage(error: unknown, fallback: string = '알 수 없는 오류가 발생했습니다.'): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    const errorLike = asErrorLike(error);

    if (typeof errorLike?.message === 'string' && errorLike.message.length > 0) {
        return errorLike.message;
    }

    if (typeof error === 'string' && error.length > 0) {
        return error;
    }

    return fallback;
}

export function getErrorStack(error: unknown): string | undefined {
    if (error instanceof Error) {
        return error.stack;
    }

    const errorLike = asErrorLike(error);
    return typeof errorLike?.stack === 'string' ? errorLike.stack : undefined;
}

export function hasErrorName(error: unknown, name: string): boolean {
    const errorLike = asErrorLike(error);
    return errorLike?.name === name;
}

export function hasErrorCode(error: unknown, code: string | number): boolean {
    const errorLike = asErrorLike(error);
    return errorLike?.code === code;
}

export function getErrorStatusCode(error: unknown): number | undefined {
    const errorLike = asErrorLike(error);

    if (!errorLike || typeof errorLike.$metadata !== 'object' || errorLike.$metadata === null) {
        return undefined;
    }

    const metadata = errorLike.$metadata as { httpStatusCode?: unknown };
    return typeof metadata.httpStatusCode === 'number' ? metadata.httpStatusCode : undefined;
}
