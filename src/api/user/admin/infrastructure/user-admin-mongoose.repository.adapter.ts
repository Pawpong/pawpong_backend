import { Injectable } from '@nestjs/common';
import {
    UserAdminAdminSnapshot,
    UserAdminDeletedReasonStatSnapshot,
    UserAdminDeletedUserListResultSnapshot,
    UserAdminDeletedUserSearchCriteria,
    UserAdminDeletedUserStatsSnapshot,
    UserAdminManagedUserRole,
    UserAdminManagedUserSnapshot,
    UserAdminPhoneWhitelistSnapshot,
    UserAdminReaderPort,
    UserAdminUserListResultSnapshot,
    UserAdminUserSearchCriteria,
} from '../application/ports/user-admin-reader.port';
import {
    UserAdminActivityLogEntry,
    UserAdminManagedUserPatch,
    UserAdminPhoneWhitelistCreateCommand,
    UserAdminPhoneWhitelistUpdateCommand,
    UserAdminWriterPort,
} from '../application/ports/user-admin-writer.port';
import { UserAdminRepository } from '../repository/user-admin.repository';

@Injectable()
export class UserAdminMongooseRepositoryAdapter implements UserAdminReaderPort, UserAdminWriterPort {
    constructor(private readonly userAdminRepository: UserAdminRepository) {}

    async findAdminById(adminId: string): Promise<UserAdminAdminSnapshot | null> {
        const admin = await this.userAdminRepository.findAdminById(adminId);
        return admin ? this.toAdminSnapshot(admin) : null;
    }

    async getUsers(criteria: UserAdminUserSearchCriteria): Promise<UserAdminUserListResultSnapshot> {
        const { items, total } = await this.userAdminRepository.getUsers(criteria);
        return {
            items: items.map((user) => ({
                ...this.toManagedUserSnapshot(user),
                role: user.role,
            })),
            total,
        };
    }

    async findManagedUserById(
        role: UserAdminManagedUserRole,
        userId: string,
    ): Promise<UserAdminManagedUserSnapshot | null> {
        const user = await this.userAdminRepository.findManagedUserById(role, userId);
        return user ? this.toManagedUserSnapshot(user) : null;
    }

    async getDeletedUsers(criteria: UserAdminDeletedUserSearchCriteria): Promise<UserAdminDeletedUserListResultSnapshot> {
        const { items, total } = await this.userAdminRepository.getDeletedUsers(criteria);
        return {
            items: items.map((user) => ({
                ...this.toManagedUserSnapshot(user),
                userRole: user.userRole,
            })),
            total,
        };
    }

    async getDeletedUserStats(): Promise<UserAdminDeletedUserStatsSnapshot> {
        const stats = await this.userAdminRepository.getDeletedUserStats();
        return {
            totalDeletedAdopters: stats.totalDeletedAdopters,
            totalDeletedBreeders: stats.totalDeletedBreeders,
            adopterReasonStats: stats.adopterReasonStats.map((item: any) => this.toDeletedReasonStat(item)),
            breederReasonStats: stats.breederReasonStats.map((item: any) => this.toDeletedReasonStat(item)),
            otherReasonDetails: [
                ...stats.adopterOtherReasons.map((item: any) => ({
                    userType: 'adopter' as const,
                    reason: item.deleteReasonDetail,
                    deletedAt: item.deletedAt.toISOString(),
                })),
                ...stats.breederOtherReasons.map((item: any) => ({
                    userType: 'breeder' as const,
                    reason: item.deleteReasonDetail,
                    deletedAt: item.deletedAt.toISOString(),
                })),
            ],
            last7DaysCount: stats.last7DaysCount,
            last30DaysCount: stats.last30DaysCount,
        };
    }

    async listPhoneWhitelist(): Promise<UserAdminPhoneWhitelistSnapshot[]> {
        const items = await this.userAdminRepository.listPhoneWhitelist();
        return items.map((item) => this.toPhoneWhitelistSnapshot(item));
    }

    async findPhoneWhitelistById(id: string): Promise<UserAdminPhoneWhitelistSnapshot | null> {
        const item = await this.userAdminRepository.findPhoneWhitelistById(id);
        return item ? this.toPhoneWhitelistSnapshot(item) : null;
    }

    async findPhoneWhitelistByPhoneNumber(phoneNumber: string): Promise<UserAdminPhoneWhitelistSnapshot | null> {
        const item = await this.userAdminRepository.findPhoneWhitelistByPhoneNumber(phoneNumber);
        return item ? this.toPhoneWhitelistSnapshot(item) : null;
    }

    async updateManagedUser(
        role: UserAdminManagedUserRole,
        userId: string,
        patch: UserAdminManagedUserPatch,
    ): Promise<UserAdminManagedUserSnapshot | null> {
        const user = await this.userAdminRepository.updateManagedUser(role, userId, patch);
        if (!user) {
            return null;
        }
        return this.toManagedUserSnapshot(user);
    }

    async deleteManagedUser(role: UserAdminManagedUserRole, userId: string): Promise<boolean> {
        return this.userAdminRepository.deleteManagedUser(role, userId);
    }

    async appendAdminActivityLog(adminId: string, logEntry: UserAdminActivityLogEntry): Promise<void> {
        await this.userAdminRepository.appendAdminActivityLog(adminId, logEntry);
    }

    async createPhoneWhitelist(
        command: UserAdminPhoneWhitelistCreateCommand,
    ): Promise<UserAdminPhoneWhitelistSnapshot> {
        const item = await this.userAdminRepository.createPhoneWhitelist(command);
        return this.toPhoneWhitelistSnapshot(item);
    }

    async updatePhoneWhitelist(
        id: string,
        command: UserAdminPhoneWhitelistUpdateCommand,
    ): Promise<UserAdminPhoneWhitelistSnapshot | null> {
        const item = await this.userAdminRepository.updatePhoneWhitelist(id, command);
        return item ? this.toPhoneWhitelistSnapshot(item) : null;
    }

    async deletePhoneWhitelist(id: string): Promise<boolean> {
        return this.userAdminRepository.deletePhoneWhitelist(id);
    }

    private toAdminSnapshot(admin: any): UserAdminAdminSnapshot {
        return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            profileImage: admin.profileImage,
            status: admin.status,
            adminLevel: admin.adminLevel,
            permissions: admin.permissions,
            activityLogs: admin.activityLogs || [],
            createdAt: admin.createdAt,
        };
    }

    private toManagedUserSnapshot(user: any): UserAdminManagedUserSnapshot {
        return {
            id: user._id.toString(),
            nickname: user.nickname,
            name: user.name,
            fullName: user.full_name,
            emailAddress: user.emailAddress,
            accountStatus: user.accountStatus,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            stats: user.stats,
            deletedAt: user.deletedAt,
            deleteReason: user.deleteReason,
            deleteReasonDetail: user.deleteReasonDetail,
            phoneNumber: user.phoneNumber,
        };
    }

    private toDeletedReasonStat(item: any): UserAdminDeletedReasonStatSnapshot {
        return {
            reason: item._id,
            count: item.count,
        };
    }

    private toPhoneWhitelistSnapshot(item: any): UserAdminPhoneWhitelistSnapshot {
        return {
            id: item._id.toString(),
            phoneNumber: item.phoneNumber,
            description: item.description,
            isActive: item.isActive,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }
}
