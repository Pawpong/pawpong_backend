import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { PhoneWhitelist, PhoneWhitelistDocument } from '../../../../schema/phone-whitelist.schema';
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

@Injectable()
export class UserAdminMongooseRepositoryAdapter implements UserAdminReaderPort, UserAdminWriterPort {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(PhoneWhitelist.name) private readonly phoneWhitelistModel: Model<PhoneWhitelistDocument>,
    ) {}

    async findAdminById(adminId: string): Promise<UserAdminAdminSnapshot | null> {
        const admin = await this.adminModel.findById(adminId).select('-password').lean();
        return admin ? this.toAdminSnapshot(admin) : null;
    }

    async getUsers(criteria: UserAdminUserSearchCriteria): Promise<UserAdminUserListResultSnapshot> {
        const { userRole, page, limit } = criteria;
        const skip = (page - 1) * limit;

        if (userRole === 'adopter') {
            const query = this.buildAdopterQuery(criteria);
            const [adopters, total] = await Promise.all([
                this.adopterModel
                    .find(query)
                    .select('nickname emailAddress accountStatus lastLoginAt createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.adopterModel.countDocuments(query),
            ]);

            return {
                items: adopters.map((user) => ({
                    ...this.toManagedUserSnapshot(user),
                    role: 'adopter' as const,
                })),
                total,
            };
        }

        if (userRole === 'breeder') {
            const query = this.buildBreederQuery(criteria);
            const [breeders, total] = await Promise.all([
                this.breederModel
                    .find(query)
                    .select('name emailAddress accountStatus lastLoginAt createdAt stats')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.breederModel.countDocuments(query),
            ]);

            return {
                items: breeders.map((user) => ({
                    ...this.toManagedUserSnapshot(user),
                    role: 'breeder' as const,
                })),
                total,
            };
        }

        const adopterQuery = this.buildAdopterQuery(criteria);
        const breederQuery = this.buildBreederQuery(criteria);

        const [adopterTotal, breederTotal, adopters, breeders] = await Promise.all([
            this.adopterModel.countDocuments(adopterQuery),
            this.breederModel.countDocuments(breederQuery),
            this.adopterModel
                .find(adopterQuery)
                .select('nickname emailAddress accountStatus lastLoginAt createdAt')
                .sort({ createdAt: -1 })
                .lean(),
            this.breederModel
                .find(breederQuery)
                .select('name emailAddress accountStatus lastLoginAt createdAt stats')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        const items = [
            ...adopters.map((user) => ({ ...this.toManagedUserSnapshot(user), role: 'adopter' as const })),
            ...breeders.map((user) => ({ ...this.toManagedUserSnapshot(user), role: 'breeder' as const })),
        ]
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            })
            .slice(skip, skip + limit);

        return {
            items,
            total: adopterTotal + breederTotal,
        };
    }

    async findManagedUserById(
        role: UserAdminManagedUserRole,
        userId: string,
    ): Promise<UserAdminManagedUserSnapshot | null> {
        const model = this.getManagedUserModel(role);
        const user = await model.findById(userId).lean();
        return user ? this.toManagedUserSnapshot(user) : null;
    }

    async getDeletedUsers(criteria: UserAdminDeletedUserSearchCriteria): Promise<UserAdminDeletedUserListResultSnapshot> {
        const { role, deleteReason, page, limit } = criteria;
        const skip = (page - 1) * limit;

        let items: Array<UserAdminManagedUserSnapshot & { userRole: UserAdminManagedUserRole }> = [];
        let total = 0;

        if (role === 'all' || role === 'adopter') {
            const adopterQuery: Record<string, any> = { accountStatus: 'deleted' };
            if (deleteReason) {
                adopterQuery.deleteReason = deleteReason;
            }

            const [adopters, adopterTotal] = await Promise.all([
                this.adopterModel
                    .find(adopterQuery)
                    .select('emailAddress nickname phoneNumber deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'adopter' ? skip : 0)
                    .limit(role === 'adopter' ? limit : Math.ceil(limit / 2))
                    .lean(),
                this.adopterModel.countDocuments(adopterQuery),
            ]);

            items.push(
                ...adopters.map((user) => ({
                    ...this.toManagedUserSnapshot(user),
                    userRole: 'adopter' as const,
                })),
            );
            total += adopterTotal;
        }

        if (role === 'all' || role === 'breeder') {
            const breederQuery: Record<string, any> = { accountStatus: 'deleted' };
            if (deleteReason) {
                breederQuery.deleteReason = deleteReason;
            }

            const [breeders, breederTotal] = await Promise.all([
                this.breederModel
                    .find(breederQuery)
                    .select('emailAddress nickname phoneNumber deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'breeder' ? skip : 0)
                    .limit(role === 'breeder' ? limit : Math.ceil(limit / 2))
                    .lean(),
                this.breederModel.countDocuments(breederQuery),
            ]);

            items.push(
                ...breeders.map((user) => ({
                    ...this.toManagedUserSnapshot(user),
                    userRole: 'breeder' as const,
                })),
            );
            total += breederTotal;
        }

        items.sort((a, b) => {
            const dateA = new Date(a.deletedAt || 0).getTime();
            const dateB = new Date(b.deletedAt || 0).getTime();
            return dateB - dateA;
        });

        if (role === 'all') {
            items = items.slice(skip, skip + limit);
        }

        return { items, total };
    }

    async getDeletedUserStats(): Promise<UserAdminDeletedUserStatsSnapshot> {
        const [totalDeletedAdopters, totalDeletedBreeders] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: 'deleted' }),
            this.breederModel.countDocuments({ accountStatus: 'deleted' }),
        ]);

        const [adopterReasonStatsRaw, breederReasonStatsRaw] = await Promise.all([
            this.adopterModel.aggregate([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
            this.breederModel.aggregate([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
        ]);

        const [adopterOtherReasons, breederOtherReasons] = await Promise.all([
            this.adopterModel
                .find({
                    accountStatus: 'deleted',
                    deleteReason: 'other',
                    deleteReasonDetail: { $exists: true, $ne: null },
                })
                .select('deleteReasonDetail deletedAt')
                .sort({ deletedAt: -1 })
                .limit(25)
                .lean(),
            this.breederModel
                .find({
                    accountStatus: 'deleted',
                    deleteReason: 'other',
                    deleteReasonDetail: { $exists: true, $ne: null },
                })
                .select('deleteReasonDetail deletedAt')
                .sort({ deletedAt: -1 })
                .limit(25)
                .lean(),
        ]);

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [last7DaysAdopters, last7DaysBreeders, last30DaysAdopters, last30DaysBreeders] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: sevenDaysAgo } }),
            this.breederModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: sevenDaysAgo } }),
            this.adopterModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: thirtyDaysAgo } }),
            this.breederModel.countDocuments({ accountStatus: 'deleted', deletedAt: { $gte: thirtyDaysAgo } }),
        ]);

        return {
            totalDeletedAdopters,
            totalDeletedBreeders,
            adopterReasonStats: adopterReasonStatsRaw.map((item: any) => this.toDeletedReasonStat(item)),
            breederReasonStats: breederReasonStatsRaw.map((item: any) => this.toDeletedReasonStat(item)),
            otherReasonDetails: [
                ...adopterOtherReasons.map((item: any) => ({
                    userType: 'adopter' as const,
                    reason: item.deleteReasonDetail,
                    deletedAt: item.deletedAt.toISOString(),
                })),
                ...breederOtherReasons.map((item: any) => ({
                    userType: 'breeder' as const,
                    reason: item.deleteReasonDetail,
                    deletedAt: item.deletedAt.toISOString(),
                })),
            ],
            last7DaysCount: last7DaysAdopters + last7DaysBreeders,
            last30DaysCount: last30DaysAdopters + last30DaysBreeders,
        };
    }

    async listPhoneWhitelist(): Promise<UserAdminPhoneWhitelistSnapshot[]> {
        const items = await this.phoneWhitelistModel.find().sort({ createdAt: -1 }).lean();
        return items.map((item) => this.toPhoneWhitelistSnapshot(item));
    }

    async findPhoneWhitelistById(id: string): Promise<UserAdminPhoneWhitelistSnapshot | null> {
        const item = await this.phoneWhitelistModel.findById(id).lean();
        return item ? this.toPhoneWhitelistSnapshot(item) : null;
    }

    async findPhoneWhitelistByPhoneNumber(phoneNumber: string): Promise<UserAdminPhoneWhitelistSnapshot | null> {
        const item = await this.phoneWhitelistModel.findOne({ phoneNumber }).lean();
        return item ? this.toPhoneWhitelistSnapshot(item) : null;
    }

    async updateManagedUser(
        role: UserAdminManagedUserRole,
        userId: string,
        patch: UserAdminManagedUserPatch,
    ): Promise<UserAdminManagedUserSnapshot | null> {
        const model = this.getManagedUserModel(role);
        const user = await model.findById(userId);

        if (!user) {
            return null;
        }

        if ('accountStatus' in patch) {
            (user as any).accountStatus = patch.accountStatus;
        }
        if ('deletedAt' in patch) {
            (user as any).deletedAt = patch.deletedAt;
        }
        if ('deleteReason' in patch) {
            (user as any).deleteReason = patch.deleteReason;
        }
        if ('deleteReasonDetail' in patch) {
            (user as any).deleteReasonDetail = patch.deleteReasonDetail;
        }
        if ('suspensionReason' in patch) {
            (user as any).suspensionReason = patch.suspensionReason;
        }
        if ('suspendedAt' in patch) {
            (user as any).suspendedAt = patch.suspendedAt;
        }

        await user.save();
        return this.toManagedUserSnapshot(user);
    }

    async deleteManagedUser(role: UserAdminManagedUserRole, userId: string): Promise<boolean> {
        const result = await this.getManagedUserModel(role).findByIdAndDelete(userId);
        return !!result;
    }

    async appendAdminActivityLog(adminId: string, logEntry: UserAdminActivityLogEntry): Promise<void> {
        const admin = await this.adminModel.findById(adminId);

        if (!admin) {
            return;
        }

        admin.activityLogs.push(logEntry as any);
        await admin.save();
    }

    async createPhoneWhitelist(
        command: UserAdminPhoneWhitelistCreateCommand,
    ): Promise<UserAdminPhoneWhitelistSnapshot> {
        const item = new this.phoneWhitelistModel({
            phoneNumber: command.phoneNumber,
            description: command.description,
            isActive: true,
            createdBy: command.createdBy,
        });

        const saved = await item.save();
        return this.toPhoneWhitelistSnapshot(saved);
    }

    async updatePhoneWhitelist(
        id: string,
        command: UserAdminPhoneWhitelistUpdateCommand,
    ): Promise<UserAdminPhoneWhitelistSnapshot | null> {
        const item = await this.phoneWhitelistModel.findById(id);

        if (!item) {
            return null;
        }

        if (command.description !== undefined) {
            item.description = command.description;
        }
        if (command.isActive !== undefined) {
            item.isActive = command.isActive;
        }

        const saved = await item.save();
        return this.toPhoneWhitelistSnapshot(saved);
    }

    async deletePhoneWhitelist(id: string): Promise<boolean> {
        const result = await this.phoneWhitelistModel.findByIdAndDelete(id);
        return !!result;
    }

    private buildAdopterQuery(criteria: UserAdminUserSearchCriteria): Record<string, any> {
        const query: Record<string, any> = {};

        if (criteria.accountStatus) {
            query.accountStatus = criteria.accountStatus;
        }
        if (criteria.searchKeyword) {
            query.$or = [
                { nickname: new RegExp(criteria.searchKeyword, 'i') },
                { emailAddress: new RegExp(criteria.searchKeyword, 'i') },
            ];
        }

        return query;
    }

    private buildBreederQuery(criteria: UserAdminUserSearchCriteria): Record<string, any> {
        const query: Record<string, any> = {};

        if (criteria.accountStatus) {
            query.accountStatus = criteria.accountStatus;
        }
        if (criteria.searchKeyword) {
            query.$or = [
                { name: new RegExp(criteria.searchKeyword, 'i') },
                { emailAddress: new RegExp(criteria.searchKeyword, 'i') },
            ];
        }

        return query;
    }

    private getManagedUserModel(role: UserAdminManagedUserRole): Model<any> {
        return role === 'adopter' ? this.adopterModel : this.breederModel;
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
