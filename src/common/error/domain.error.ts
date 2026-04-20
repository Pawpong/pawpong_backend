export abstract class DomainError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string,
    ) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class DomainValidationError extends DomainError {
    constructor(message: string, code: string = 'DOMAIN_VALIDATION') {
        super(message, 400, code);
    }
}

export class DomainAuthorizationError extends DomainError {
    constructor(message: string, code: string = 'DOMAIN_AUTHORIZATION') {
        super(message, 403, code);
    }
}

export class DomainAuthenticationError extends DomainError {
    constructor(message: string, code: string = 'DOMAIN_AUTHENTICATION') {
        super(message, 401, code);
    }
}

export class DomainConflictError extends DomainError {
    constructor(message: string, code: string = 'DOMAIN_CONFLICT') {
        super(message, 409, code);
    }
}

export class DomainNotFoundError extends DomainError {
    constructor(message: string, code: string = 'DOMAIN_NOT_FOUND') {
        super(message, 404, code);
    }
}
