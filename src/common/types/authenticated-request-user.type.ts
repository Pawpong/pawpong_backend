import type { Request } from 'express';

export type AuthenticatedRequestUser = {
    userId: string;
    email: string;
    role: string;
    adminLevel?: string;
    [key: string]: unknown;
};

export type JwtPayloadClaims = {
    sub: string;
    email: string;
    role: string;
    adminLevel?: string;
};

export type RequestWithUser = Request & {
    user?: AuthenticatedRequestUser;
};

export type AuthGuardInfo = {
    name?: string;
    message?: string;
};

