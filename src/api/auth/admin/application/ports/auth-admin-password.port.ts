export const AUTH_ADMIN_PASSWORD_PORT = Symbol('AUTH_ADMIN_PASSWORD_PORT');

export interface AuthAdminPasswordPort {
    compare(plainText: string, passwordHash: string): Promise<boolean>;
}
