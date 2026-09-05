import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../../schema/breeder.schema';
import { VerificationStatus } from '../../../../../common/enum/user.enum';
import { BreederVerificationAdminSearchCriteria } from '../application/ports/breeder-verification-admin-reader.port';
import {
    BreederVerificationAdminActivityLogEntry,
    BreederVerificationAdminUpdateVerificationCommand,
} from '../application/ports/breeder-verification-admin-writer.port';
import type {
    BreederAdminAdminDocumentRecord,
    BreederAdminBreederDocumentRecord,
} from '../../types/breeder-admin-record.type';

@Injectable()
export class BreederVerificationAdminRepository {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    findAdminById(adminId: string): Promise<BreederAdminAdminDocumentRecord | null> {
        return this.adminModel
            .findById(adminId)
            .select('name permissions')
            .lean<BreederAdminAdminDocumentRecord>()
            .exec();
    }

    getPendingBreeders(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<{ items: BreederAdminBreederDocumentRecord[]; total: number }> {
        const { verificationStatus, cityName, searchKeyword, pageNumber, itemsPerPage } = criteria;
        const query: FilterQuery<BreederDocument> = {};

        if (verificationStatus) {
            query['verification.status'] = verificationStatus;
        } else {
            query['verification.status'] = { $in: ['pending', 'reviewing'] };
        }

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [
                { nickname: new RegExp(searchKeyword, 'i') },
                { emailAddress: new RegExp(searchKeyword, 'i') },
            ];
        }

        return this.search(query, pageNumber, itemsPerPage, { 'verification.submittedAt': -1 });
    }

    getBreeders(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<{ items: BreederAdminBreederDocumentRecord[]; total: number }> {
        const { verificationStatus, cityName, searchKeyword, pageNumber, itemsPerPage } = criteria;
        const query: FilterQuery<BreederDocument> = {};

        if (verificationStatus) {
            query['verification.status'] = verificationStatus;
        }

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [
                { nickname: new RegExp(searchKeyword, 'i') },
                { emailAddress: new RegExp(searchKeyword, 'i') },
            ];
        }

        return this.search(query, pageNumber, itemsPerPage, { createdAt: -1 });
    }

    findBreederById(breederId: string): Promise<BreederAdminBreederDocumentRecord | null> {
        return this.breederModel
            .findById(breederId)
            .select(
                '_id name nickname emailAddress phoneNumber accountStatus isTestAccount verification profile createdAt updatedAt breeds',
            )
            .lean<BreederAdminBreederDocumentRecord>()
            .exec();
    }

    countApprovedBreeders() {
        return this.breederModel.countDocuments({ 'verification.status': VerificationStatus.APPROVED });
    }

    findApprovedBreedersMissingDocuments(reviewedBefore: Date): Promise<BreederAdminBreederDocumentRecord[]> {
        return this.breederModel
            .find({
                'verification.status': 'approved',
                'verification.reviewedAt': { $lte: reviewedBefore },
                $or: [{ 'verification.documents': { $exists: false } }, { 'verification.documents': { $size: 0 } }],
            })
            .select('_id name nickname emailAddress phoneNumber verification')
            .lean<BreederAdminBreederDocumentRecord[]>()
            .exec();
    }

    async updateBreederVerification(
        breederId: string,
        command: BreederVerificationAdminUpdateVerificationCommand,
    ): Promise<void> {
        const $set: Record<string, unknown> = {
            'verification.status': command.verificationStatus,
            'verification.reviewedAt': command.reviewedAt,
        };
        const $unset: Record<string, ''> = {};

        if (command.rejectionReason !== undefined) {
            $set['verification.rejectionReason'] = command.rejectionReason;
        } else if (command.verificationStatus === 'approved') {
            $unset['verification.rejectionReason'] = '';
        }

        const update: Record<string, Record<string, unknown>> = {};
        if (Object.keys($set).length > 0) {
            update.$set = $set;
        }
        if (Object.keys($unset).length > 0) {
            update.$unset = $unset;
        }
        await this.breederModel.updateOne({ _id: breederId }, update);
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederVerificationAdminActivityLogEntry): Promise<void> {
        await this.adminModel.findByIdAndUpdate(adminId, {
            $push: {
                activityLogs: logEntry,
            },
        });
    }

    private async search(
        query: FilterQuery<BreederDocument>,
        pageNumber: number,
        itemsPerPage: number,
        sort: Record<string, 1 | -1>,
    ): Promise<{ items: BreederAdminBreederDocumentRecord[]; total: number }> {
        const skip = (pageNumber - 1) * itemsPerPage;

        const [items, total] = await Promise.all([
            this.breederModel
                .find(query)
                .select(
                    '_id name nickname emailAddress phoneNumber accountStatus isTestAccount verification profile createdAt',
                )
                .sort(sort)
                .skip(skip)
                .limit(itemsPerPage)
                .lean<BreederAdminBreederDocumentRecord[]>()
                .exec(),
            this.breederModel.countDocuments(query),
        ]);

        return {
            items,
            total,
        };
    }
}
