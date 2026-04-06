import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../../schema/breeder.schema';
import {
    BreederVerificationAdminAdminSnapshot,
    BreederVerificationAdminBreederSnapshot,
    BreederVerificationAdminListResultSnapshot,
    BreederVerificationAdminReaderPort,
    BreederVerificationAdminSearchCriteria,
    BreederVerificationAdminStatsSnapshot,
} from '../application/ports/breeder-verification-admin-reader.port';
import {
    BreederVerificationAdminActivityLogEntry,
    BreederVerificationAdminUpdateVerificationCommand,
    BreederVerificationAdminWriterPort,
} from '../application/ports/breeder-verification-admin-writer.port';

@Injectable()
export class BreederVerificationAdminMongooseRepositoryAdapter
    implements BreederVerificationAdminReaderPort, BreederVerificationAdminWriterPort
{
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private readonly breederModel: Model<BreederDocument>,
    ) {}

    async findAdminById(adminId: string): Promise<BreederVerificationAdminAdminSnapshot | null> {
        const admin = await this.adminModel.findById(adminId).select('name permissions').lean();
        return admin
            ? {
                  id: admin._id.toString(),
                  name: admin.name,
                  permissions: admin.permissions,
              }
            : null;
    }

    async getLevelChangeRequests(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<BreederVerificationAdminListResultSnapshot> {
        const { cityName, searchKeyword, pageNumber, itemsPerPage } = criteria;
        const query: Record<string, any> = {
            'verification.isLevelChangeRequested': true,
            'verification.status': 'reviewing',
        };

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [
                { nickname: { $regex: searchKeyword, $options: 'i' } },
                { emailAddress: { $regex: searchKeyword, $options: 'i' } },
                { phoneNumber: { $regex: searchKeyword, $options: 'i' } },
            ];
        }

        return this.search(query, pageNumber, itemsPerPage, { 'verification.submittedAt': -1 });
    }

    async getPendingBreeders(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<BreederVerificationAdminListResultSnapshot> {
        const { verificationStatus, cityName, searchKeyword, pageNumber, itemsPerPage } = criteria;
        const query: Record<string, any> = {
            'verification.isLevelChangeRequested': { $ne: true },
        };

        if (verificationStatus) {
            query['verification.status'] = verificationStatus;
        } else {
            query['verification.status'] = { $in: ['pending', 'reviewing'] };
        }

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [{ nickname: new RegExp(searchKeyword, 'i') }, { emailAddress: new RegExp(searchKeyword, 'i') }];
        }

        return this.search(query, pageNumber, itemsPerPage, { 'verification.submittedAt': -1 });
    }

    async getBreeders(criteria: BreederVerificationAdminSearchCriteria): Promise<BreederVerificationAdminListResultSnapshot> {
        const { verificationStatus, cityName, searchKeyword, pageNumber, itemsPerPage } = criteria;
        const query: Record<string, any> = {};

        if (verificationStatus) {
            query['verification.status'] = verificationStatus;
        }

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [{ nickname: new RegExp(searchKeyword, 'i') }, { emailAddress: new RegExp(searchKeyword, 'i') }];
        }

        return this.search(query, pageNumber, itemsPerPage, { createdAt: -1 });
    }

    async findBreederById(breederId: string): Promise<BreederVerificationAdminBreederSnapshot | null> {
        const breeder = await this.breederModel
            .findById(breederId)
            .select(
                '_id name nickname emailAddress phoneNumber accountStatus isTestAccount verification profile createdAt updatedAt breeds',
            )
            .lean();

        return breeder ? this.toBreederSnapshot(breeder) : null;
    }

    async getApprovedBreederStats(): Promise<BreederVerificationAdminStatsSnapshot> {
        const query = { 'verification.status': 'approved' };

        const [totalApproved, eliteCount] = await Promise.all([
            this.breederModel.countDocuments(query),
            this.breederModel.countDocuments({
                ...query,
                'verification.plan': 'premium',
            }),
        ]);

        return {
            totalApproved,
            eliteCount,
        };
    }

    async findApprovedBreedersMissingDocuments(reviewedBefore: Date): Promise<BreederVerificationAdminBreederSnapshot[]> {
        const breeders = await this.breederModel
            .find({
                'verification.status': 'approved',
                'verification.reviewedAt': { $lte: reviewedBefore },
                $or: [{ 'verification.documents': { $exists: false } }, { 'verification.documents': { $size: 0 } }],
            })
            .select('_id name nickname emailAddress phoneNumber verification')
            .lean();

        return breeders.map((breeder) => this.toBreederSnapshot(breeder));
    }

    async updateBreederVerification(
        breederId: string,
        command: BreederVerificationAdminUpdateVerificationCommand,
    ): Promise<void> {
        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            return;
        }

        breeder.verification.status = command.verificationStatus;
        breeder.verification.reviewedAt = command.reviewedAt;

        if (command.rejectionReason !== undefined) {
            breeder.verification.rejectionReason = command.rejectionReason;
        }

        if (command.appendLevelChangeHistory) {
            if (!breeder.verification.levelChangeHistory) {
                breeder.verification.levelChangeHistory = [];
            }

            breeder.verification.levelChangeHistory.push(command.appendLevelChangeHistory as any);
        }

        if (command.clearLevelChangeRequest) {
            breeder.verification.isLevelChangeRequested = false;
            breeder.verification.levelChangeRequest = undefined;
        }

        await breeder.save({ validateBeforeSave: false });
    }

    async updateBreederLevel(breederId: string, newLevel: string): Promise<void> {
        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            return;
        }

        breeder.verification.level = newLevel;
        await breeder.save({ validateBeforeSave: false });
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederVerificationAdminActivityLogEntry): Promise<void> {
        await this.adminModel.findByIdAndUpdate(adminId, {
            $push: {
                activityLogs: logEntry,
            },
        });
    }

    private async search(
        query: Record<string, any>,
        pageNumber: number,
        itemsPerPage: number,
        sort: Record<string, 1 | -1>,
    ): Promise<BreederVerificationAdminListResultSnapshot> {
        const skip = (pageNumber - 1) * itemsPerPage;

        const [breeders, total] = await Promise.all([
            this.breederModel
                .find(query)
                .select(
                    '_id name nickname emailAddress phoneNumber accountStatus isTestAccount verification profile createdAt',
                )
                .sort(sort)
                .skip(skip)
                .limit(itemsPerPage)
                .lean(),
            this.breederModel.countDocuments(query),
        ]);

        return {
            items: breeders.map((breeder) => this.toBreederSnapshot(breeder)),
            total,
        };
    }

    private toBreederSnapshot(breeder: any): BreederVerificationAdminBreederSnapshot {
        return {
            id: breeder._id.toString(),
            name: breeder.name,
            nickname: breeder.nickname,
            emailAddress: breeder.emailAddress,
            phoneNumber: breeder.phoneNumber,
            accountStatus: breeder.accountStatus,
            isTestAccount: breeder.isTestAccount,
            verification: breeder.verification,
            profile: breeder.profile,
            breeds: breeder.breeds,
            createdAt: breeder.createdAt,
            updatedAt: breeder.updatedAt,
        };
    }
}
