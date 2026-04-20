import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Adopter, AdopterDocument } from '../../../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { PhoneWhitelist, PhoneWhitelistDocument } from '../../../../schema/phone-whitelist.schema';
import {
    UserAdminDeletedUserSearchCriteria,
    UserAdminManagedUserRole,
    UserAdminUserSearchCriteria,
} from '../application/ports/user-admin-reader.port';
import {
    UserAdminActivityLogEntry,
    UserAdminManagedUserPatch,
    UserAdminPhoneWhitelistCreateCommand,
    UserAdminPhoneWhitelistUpdateCommand,
} from '../application/ports/user-admin-writer.port';
import type {
    UserAdminAdminDocumentRecord,
    UserAdminDeletedReasonAggregateRecord,
    UserAdminDeletedUserListItemRecord,
    UserAdminDeletedUserStatsDocumentRecord,
    UserAdminManagedUserDocumentRecord,
    UserAdminManagedUserListItemRecord,
    UserAdminPhoneWhitelistDocumentRecord,
} from '../types/user-admin-record.type';

@Injectable()
export class UserAdminRepository {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private readonly adopterModel: Model<AdopterDocument>,
        @InjectModel(PhoneWhitelist.name) private readonly phoneWhitelistModel: Model<PhoneWhitelistDocument>,
    ) {}

    findAdminById(adminId: string): Promise<UserAdminAdminDocumentRecord | null> {
        return this.adminModel.findById(adminId).select('-password').lean<UserAdminAdminDocumentRecord>().exec();
    }

    async getUsers(criteria: UserAdminUserSearchCriteria): Promise<{
        items: UserAdminManagedUserListItemRecord[];
        total: number;
    }> {
        const { userRole, page, limit } = criteria;
        const skip = (page - 1) * limit;

        if (userRole === 'adopter') {
            const query = this.buildAdopterQuery(criteria);
            const [items, total] = await Promise.all([
                this.adopterModel
                    .find(query)
                    .select('nickname emailAddress accountStatus lastLoginAt createdAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean<UserAdminManagedUserDocumentRecord[]>()
                    .exec(),
                this.adopterModel.countDocuments(query),
            ]);

            return {
                items: items.map((user) => ({ ...user, role: 'adopter' as const })),
                total,
            };
        }

        if (userRole === 'breeder') {
            const query = this.buildBreederQuery(criteria);
            const [items, total] = await Promise.all([
                this.breederModel
                    .find(query)
                    .select('name emailAddress accountStatus lastLoginAt createdAt stats')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean<UserAdminManagedUserDocumentRecord[]>()
                    .exec(),
                this.breederModel.countDocuments(query),
            ]);

            return {
                items: items.map((user) => ({ ...user, role: 'breeder' as const })),
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
                .lean<UserAdminManagedUserDocumentRecord[]>()
                .exec(),
            this.breederModel
                .find(breederQuery)
                .select('name emailAddress accountStatus lastLoginAt createdAt stats')
                .sort({ createdAt: -1 })
                .lean<UserAdminManagedUserDocumentRecord[]>()
                .exec(),
        ]);

        const items = [
            ...adopters.map((user) => ({ ...user, role: 'adopter' as const })),
            ...breeders.map((user) => ({ ...user, role: 'breeder' as const })),
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

    findManagedUserById(role: UserAdminManagedUserRole, userId: string): Promise<UserAdminManagedUserDocumentRecord | null> {
        if (role === 'adopter') {
            return this.adopterModel.findById(userId).lean<UserAdminManagedUserDocumentRecord>().exec();
        }

        return this.breederModel.findById(userId).lean<UserAdminManagedUserDocumentRecord>().exec();
    }

    async getDeletedUsers(criteria: UserAdminDeletedUserSearchCriteria): Promise<{
        items: UserAdminDeletedUserListItemRecord[];
        total: number;
    }> {
        const { role, deleteReason, page, limit } = criteria;
        const skip = (page - 1) * limit;

        let items: UserAdminDeletedUserListItemRecord[] = [];
        let total = 0;

        if (role === 'all' || role === 'adopter') {
            const query = this.buildDeletedUserQuery(deleteReason);
            const [adopters, adopterTotal] = await Promise.all([
                this.adopterModel
                    .find(query)
                    .select('emailAddress nickname phoneNumber deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'adopter' ? skip : 0)
                    .limit(role === 'adopter' ? limit : Math.ceil(limit / 2))
                    .lean<UserAdminManagedUserDocumentRecord[]>()
                    .exec(),
                this.adopterModel.countDocuments(query),
            ]);

            items.push(...adopters.map((user) => ({ ...user, userRole: 'adopter' as const })));
            total += adopterTotal;
        }

        if (role === 'all' || role === 'breeder') {
            const query = this.buildDeletedUserQuery(deleteReason);
            const [breeders, breederTotal] = await Promise.all([
                this.breederModel
                    .find(query)
                    .select('emailAddress nickname phoneNumber deleteReason deleteReasonDetail deletedAt createdAt')
                    .sort({ deletedAt: -1 })
                    .skip(role === 'breeder' ? skip : 0)
                    .limit(role === 'breeder' ? limit : Math.ceil(limit / 2))
                    .lean<UserAdminManagedUserDocumentRecord[]>()
                    .exec(),
                this.breederModel.countDocuments(query),
            ]);

            items.push(...breeders.map((user) => ({ ...user, userRole: 'breeder' as const })));
            total += breederTotal;
        }

        items.sort((a, b) => {
            const dateA = new Date(a.deletedAt || 0).getTime();
            const dateB = new Date(b.deletedAt || 0).getTime();
            return dateB - dateA;
        });

        return {
            items: role === 'all' ? items.slice(skip, skip + limit) : items,
            total,
        };
    }

    async getDeletedUserStats(): Promise<UserAdminDeletedUserStatsDocumentRecord> {
        const [totalDeletedAdopters, totalDeletedBreeders] = await Promise.all([
            this.adopterModel.countDocuments({ accountStatus: 'deleted' }),
            this.breederModel.countDocuments({ accountStatus: 'deleted' }),
        ]);

        const [adopterReasonStats, breederReasonStats] = await Promise.all([
            this.adopterModel.aggregate<UserAdminDeletedReasonAggregateRecord>([
                { $match: { accountStatus: 'deleted', deleteReason: { $exists: true, $ne: null } } },
                { $group: { _id: '$deleteReason', count: { $sum: 1 } } },
            ]),
            this.breederModel.aggregate<UserAdminDeletedReasonAggregateRecord>([
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
                .lean<{ deleteReasonDetail?: string; deletedAt?: Date }[]>()
                .exec(),
            this.breederModel
                .find({
                    accountStatus: 'deleted',
                    deleteReason: 'other',
                    deleteReasonDetail: { $exists: true, $ne: null },
                })
                .select('deleteReasonDetail deletedAt')
                .sort({ deletedAt: -1 })
                .limit(25)
                .lean<{ deleteReasonDetail?: string; deletedAt?: Date }[]>()
                .exec(),
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
            adopterReasonStats,
            breederReasonStats,
            adopterOtherReasons,
            breederOtherReasons,
            last7DaysCount: last7DaysAdopters + last7DaysBreeders,
            last30DaysCount: last30DaysAdopters + last30DaysBreeders,
        };
    }

    listPhoneWhitelist(): Promise<UserAdminPhoneWhitelistDocumentRecord[]> {
        return this.phoneWhitelistModel.find().sort({ createdAt: -1 }).lean<UserAdminPhoneWhitelistDocumentRecord[]>().exec();
    }

    findPhoneWhitelistById(id: string): Promise<UserAdminPhoneWhitelistDocumentRecord | null> {
        return this.phoneWhitelistModel.findById(id).lean<UserAdminPhoneWhitelistDocumentRecord>().exec();
    }

    findPhoneWhitelistByPhoneNumber(phoneNumber: string): Promise<UserAdminPhoneWhitelistDocumentRecord | null> {
        return this.phoneWhitelistModel.findOne({ phoneNumber }).lean<UserAdminPhoneWhitelistDocumentRecord>().exec();
    }

    updateManagedUser(role: UserAdminManagedUserRole, userId: string, patch: UserAdminManagedUserPatch) {
        const $set: Record<string, unknown> = {};
        const $unset: Record<string, ''> = {};

        if ('accountStatus' in patch && patch.accountStatus !== undefined) {
            $set.accountStatus = patch.accountStatus;
        }
        if ('deletedAt' in patch) {
            if (patch.deletedAt === undefined) {
                $unset.deletedAt = '';
            } else {
                $set.deletedAt = patch.deletedAt;
            }
        }
        if ('deleteReason' in patch) {
            if (patch.deleteReason === undefined) {
                $unset.deleteReason = '';
            } else {
                $set.deleteReason = patch.deleteReason;
            }
        }
        if ('deleteReasonDetail' in patch) {
            if (patch.deleteReasonDetail === undefined) {
                $unset.deleteReasonDetail = '';
            } else {
                $set.deleteReasonDetail = patch.deleteReasonDetail;
            }
        }
        if ('suspensionReason' in patch) {
            if (patch.suspensionReason === undefined) {
                $unset.suspensionReason = '';
            } else {
                $set.suspensionReason = patch.suspensionReason;
            }
        }
        if ('suspendedAt' in patch) {
            if (patch.suspendedAt === undefined) {
                $unset.suspendedAt = '';
            } else {
                $set.suspendedAt = patch.suspendedAt;
            }
        }

        const update: Record<string, Record<string, unknown>> = {};
        if (Object.keys($set).length > 0) {
            update.$set = $set;
        }
        if (Object.keys($unset).length > 0) {
            update.$unset = $unset;
        }

        if (role === 'adopter') {
            return this.adopterModel
                .findByIdAndUpdate(userId, update, { new: true })
                .lean<UserAdminManagedUserDocumentRecord>()
                .exec();
        }

        return this.breederModel
            .findByIdAndUpdate(userId, update, { new: true })
            .lean<UserAdminManagedUserDocumentRecord>()
            .exec();
    }

    async deleteManagedUser(role: UserAdminManagedUserRole, userId: string): Promise<boolean> {
        const result =
            role === 'adopter'
                ? await this.adopterModel.findByIdAndDelete(userId)
                : await this.breederModel.findByIdAndDelete(userId);
        return !!result;
    }

    async appendAdminActivityLog(adminId: string, logEntry: UserAdminActivityLogEntry): Promise<void> {
        await this.adminModel.findByIdAndUpdate(adminId, {
            $push: {
                activityLogs: logEntry,
            },
        });
    }

    async createPhoneWhitelist(command: UserAdminPhoneWhitelistCreateCommand) {
        const [created] = await this.phoneWhitelistModel.create([
            {
                phoneNumber: command.phoneNumber,
                description: command.description,
                isActive: true,
                createdBy: command.createdBy,
            },
        ]);

        return created.toObject() as UserAdminPhoneWhitelistDocumentRecord;
    }

    updatePhoneWhitelist(id: string, command: UserAdminPhoneWhitelistUpdateCommand): Promise<UserAdminPhoneWhitelistDocumentRecord | null> {
        const $set: Record<string, unknown> = {};

        if (command.description !== undefined) {
            $set.description = command.description;
        }
        if (command.isActive !== undefined) {
            $set.isActive = command.isActive;
        }

        return this.phoneWhitelistModel
            .findByIdAndUpdate(id, { $set }, { new: true })
            .lean<UserAdminPhoneWhitelistDocumentRecord>()
            .exec();
    }

    async deletePhoneWhitelist(id: string): Promise<boolean> {
        const result = await this.phoneWhitelistModel.findByIdAndDelete(id);
        return !!result;
    }

    private buildAdopterQuery(criteria: UserAdminUserSearchCriteria): FilterQuery<AdopterDocument> {
        const query: FilterQuery<AdopterDocument> = {};

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

    private buildBreederQuery(criteria: UserAdminUserSearchCriteria): FilterQuery<BreederDocument> {
        const query: FilterQuery<BreederDocument> = {};

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

    private buildDeletedUserQuery(deleteReason?: string): { accountStatus: 'deleted'; deleteReason?: string } {
        const query: { accountStatus: 'deleted'; deleteReason?: string } = { accountStatus: 'deleted' };
        if (deleteReason) {
            query.deleteReason = deleteReason;
        }
        return query;
    }

}
