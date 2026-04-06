import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import {
    BreederAdminAdminSnapshot,
    BreederAdminBreederSnapshot,
    BreederAdminReaderPort,
} from '../application/ports/breeder-admin-reader.port';
import {
    BreederAdminActivityLogEntry,
    BreederAdminBreederPatch,
    BreederAdminWriterPort,
} from '../application/ports/breeder-admin-writer.port';

@Injectable()
export class BreederAdminMongooseRepositoryAdapter implements BreederAdminReaderPort, BreederAdminWriterPort {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async findAdminById(adminId: string): Promise<BreederAdminAdminSnapshot | null> {
        const admin = await this.adminModel.findById(adminId).select('name permissions activityLogs').lean();
        return admin ? this.toAdminSnapshot(admin) : null;
    }

    async findBreederById(breederId: string): Promise<BreederAdminBreederSnapshot | null> {
        const breeder = await this.breederModel
            .findById(breederId)
            .select('name nickname emailAddress accountStatus suspensionReason suspendedAt isTestAccount verification')
            .lean();

        return breeder ? this.toBreederSnapshot(breeder) : null;
    }

    async updateBreeder(
        breederId: string,
        patch: BreederAdminBreederPatch,
    ): Promise<BreederAdminBreederSnapshot | null> {
        const $set: Record<string, unknown> = {};
        const $unset: Record<string, ''> = {};

        if (patch.accountStatus !== undefined) {
            $set.accountStatus = patch.accountStatus;
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

        if (patch.isTestAccount !== undefined) {
            $set.isTestAccount = patch.isTestAccount;
        }

        const update: Record<string, Record<string, unknown>> = {};
        if (Object.keys($set).length > 0) {
            update.$set = $set;
        }
        if (Object.keys($unset).length > 0) {
            update.$unset = $unset;
        }

        const breeder = await this.breederModel
            .findByIdAndUpdate(breederId, update, { new: true })
            .select('name nickname emailAddress accountStatus suspensionReason suspendedAt isTestAccount verification')
            .lean();

        return breeder ? this.toBreederSnapshot(breeder) : null;
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederAdminActivityLogEntry): Promise<void> {
        await this.adminModel.findByIdAndUpdate(adminId, {
            $push: {
                activityLogs: logEntry,
            },
        });
    }

    private toAdminSnapshot(admin: any): BreederAdminAdminSnapshot {
        return {
            id: admin._id.toString(),
            name: admin.name,
            permissions: admin.permissions,
            activityLogs: admin.activityLogs,
        };
    }

    private toBreederSnapshot(breeder: any): BreederAdminBreederSnapshot {
        return {
            id: breeder._id.toString(),
            name: breeder.name,
            nickname: breeder.nickname,
            emailAddress: breeder.emailAddress,
            accountStatus: breeder.accountStatus,
            suspensionReason: breeder.suspensionReason,
            suspendedAt: breeder.suspendedAt,
            isTestAccount: breeder.isTestAccount,
            verification: breeder.verification
                ? {
                      status: breeder.verification.status,
                  }
                : undefined,
        };
    }
}
