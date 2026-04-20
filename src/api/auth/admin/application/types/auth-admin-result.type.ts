import type { AuthAdminSnapshot } from '../ports/auth-admin-reader.port';

export interface AdminLoginResult {
    adminId: string;
    email: string;
    name: string;
    adminLevel: AuthAdminSnapshot['adminLevel'];
    permissions: AuthAdminSnapshot['permissions'];
    accessToken: string;
    refreshToken: string;
}

export interface AdminRefreshTokenResult {
    accessToken: string;
}
