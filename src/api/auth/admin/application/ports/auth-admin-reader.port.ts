export interface AuthAdminPermissionSnapshot {
    canManageUsers: boolean;
    canManageBreeders: boolean;
    canManageReports: boolean;
    canViewStatistics: boolean;
    canManageAdmins: boolean;
}

export interface AuthAdminSnapshot {
    adminId: string;
    email: string;
    passwordHash: string;
    name: string;
    adminLevel: string;
    permissions: AuthAdminPermissionSnapshot;
}

export const AUTH_ADMIN_READER = Symbol('AUTH_ADMIN_READER');

export interface AuthAdminReaderPort {
    findActiveByEmail(email: string): Promise<AuthAdminSnapshot | null>;
    updateLastLogin(adminId: string): Promise<void>;
}
