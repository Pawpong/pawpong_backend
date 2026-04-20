import { Injectable } from '@nestjs/common';
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
import { BreederVerificationAdminRepository } from '../repository/breeder-verification-admin.repository';
import type { BreederAdminBreederDocumentRecord } from '../../types/breeder-admin-record.type';

@Injectable()
export class BreederVerificationAdminMongooseRepositoryAdapter
    implements BreederVerificationAdminReaderPort, BreederVerificationAdminWriterPort
{
    constructor(private readonly breederVerificationAdminRepository: BreederVerificationAdminRepository) {}

    async findAdminById(adminId: string): Promise<BreederVerificationAdminAdminSnapshot | null> {
        const admin = await this.breederVerificationAdminRepository.findAdminById(adminId);
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
        const result = await this.breederVerificationAdminRepository.getLevelChangeRequests(criteria);
        return {
            items: result.items.map((breeder) => this.toBreederSnapshot(breeder)),
            total: result.total,
        };
    }

    async getPendingBreeders(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<BreederVerificationAdminListResultSnapshot> {
        const result = await this.breederVerificationAdminRepository.getPendingBreeders(criteria);
        return {
            items: result.items.map((breeder) => this.toBreederSnapshot(breeder)),
            total: result.total,
        };
    }

    async getBreeders(criteria: BreederVerificationAdminSearchCriteria): Promise<BreederVerificationAdminListResultSnapshot> {
        const result = await this.breederVerificationAdminRepository.getBreeders(criteria);
        return {
            items: result.items.map((breeder) => this.toBreederSnapshot(breeder)),
            total: result.total,
        };
    }

    async findBreederById(breederId: string): Promise<BreederVerificationAdminBreederSnapshot | null> {
        const breeder = await this.breederVerificationAdminRepository.findBreederById(breederId);
        return breeder ? this.toBreederSnapshot(breeder) : null;
    }

    async getApprovedBreederStats(): Promise<BreederVerificationAdminStatsSnapshot> {
        const [totalApproved, eliteCount] = await Promise.all([
            this.breederVerificationAdminRepository.countApprovedBreeders(),
            this.breederVerificationAdminRepository.countApprovedEliteBreeders(),
        ]);

        return {
            totalApproved,
            eliteCount,
        };
    }

    async findApprovedBreedersMissingDocuments(reviewedBefore: Date): Promise<BreederVerificationAdminBreederSnapshot[]> {
        const breeders = await this.breederVerificationAdminRepository.findApprovedBreedersMissingDocuments(reviewedBefore);
        return breeders.map((breeder) => this.toBreederSnapshot(breeder));
    }

    async updateBreederVerification(
        breederId: string,
        command: BreederVerificationAdminUpdateVerificationCommand,
    ): Promise<void> {
        await this.breederVerificationAdminRepository.updateBreederVerification(breederId, command);
    }

    async updateBreederLevel(breederId: string, newLevel: string): Promise<void> {
        await this.breederVerificationAdminRepository.updateBreederLevel(breederId, newLevel);
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederVerificationAdminActivityLogEntry): Promise<void> {
        await this.breederVerificationAdminRepository.appendAdminActivityLog(adminId, logEntry);
    }

    private toBreederSnapshot(breeder: BreederAdminBreederDocumentRecord): BreederVerificationAdminBreederSnapshot {
        return {
            id: breeder._id.toString(),
            name: breeder.name,
            nickname: breeder.nickname || '',
            emailAddress: breeder.emailAddress || '',
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
