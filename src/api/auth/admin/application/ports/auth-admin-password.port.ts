export const AUTH_ADMIN_PASSWORD = Symbol('AUTH_ADMIN_PASSWORD');

export interface AuthAdminPasswordPort {
    compare(plainText: string, passwordHash: string): Promise<boolean>;
}
