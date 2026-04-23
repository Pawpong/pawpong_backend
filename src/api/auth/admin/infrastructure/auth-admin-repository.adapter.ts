import { Injectable } from '@nestjs/common';

import type { AdminDocument } from '../../../../schema/admin.schema';
import { AuthAdminRepository } from '../../repository/auth-admin.repository';
import { AuthAdminReaderPort, AuthAdminSnapshot } from '../application/ports/auth-admin-reader.port';

@Injectable()
export class AuthAdminRepositoryAdapter implements AuthAdminReaderPort {
    constructor(private readonly authAdminRepository: AuthAdminRepository) {}

    async findActiveByEmail(email: string): Promise<AuthAdminSnapshot | null> {
        const admin = await this.authAdminRepository.findActiveByEmail(email);

        if (!admin) {
            return null;
        }

        return this.toSnapshot(admin);
    }

    async updateLastLogin(adminId: string): Promise<void> {
        await this.authAdminRepository.updateLastLogin(adminId);
    }

    private toSnapshot(admin: AdminDocument): AuthAdminSnapshot {
        return {
            adminId: admin._id.toString(),
            email: admin.email,
            passwordHash: admin.password,
            name: admin.name,
            adminLevel: admin.adminLevel,
            permissions: {
                canManageUsers: admin.permissions?.canManageUsers ?? false,
                canManageBreeders: admin.permissions?.canManageBreeders ?? false,
                canManageReports: admin.permissions?.canManageReports ?? false,
                canViewStatistics: admin.permissions?.canViewStatistics ?? false,
                canManageAdmins: admin.permissions?.canManageAdmins ?? false,
            },
        };
    }
}
