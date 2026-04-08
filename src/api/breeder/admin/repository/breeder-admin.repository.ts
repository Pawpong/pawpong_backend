import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import {
    BreederAdminActivityLogEntry,
    BreederAdminBreederPatch,
} from '../application/ports/breeder-admin-writer.port';

@Injectable()
export class BreederAdminRepository {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    findAdminById(adminId: string) {
        return this.adminModel.findById(adminId).select('name permissions activityLogs').lean();
    }

    findBreederById(breederId: string) {
        return this.breederModel
            .findById(breederId)
            .select('name nickname emailAddress accountStatus suspensionReason suspendedAt isTestAccount verification')
            .lean();
    }

    updateBreeder(breederId: string, patch: BreederAdminBreederPatch) {
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

        return this.breederModel
            .findByIdAndUpdate(breederId, update, { new: true })
            .select('name nickname emailAddress accountStatus suspensionReason suspendedAt isTestAccount verification')
            .lean();
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederAdminActivityLogEntry): Promise<void> {
        await this.adminModel.findByIdAndUpdate(adminId, {
            $push: {
                activityLogs: logEntry,
            },
        });
    }
}
