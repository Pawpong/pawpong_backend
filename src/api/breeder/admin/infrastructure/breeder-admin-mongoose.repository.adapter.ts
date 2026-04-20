import { Injectable } from '@nestjs/common';
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
import { BreederAdminRepository } from '../repository/breeder-admin.repository';
import type { BreederAdminAdminDocumentRecord, BreederAdminBreederDocumentRecord } from '../types/breeder-admin-record.type';

@Injectable()
export class BreederAdminMongooseRepositoryAdapter implements BreederAdminReaderPort, BreederAdminWriterPort {
    constructor(private readonly breederAdminRepository: BreederAdminRepository) {}

    async findAdminById(adminId: string): Promise<BreederAdminAdminSnapshot | null> {
        const admin = await this.breederAdminRepository.findAdminById(adminId);
        return admin ? this.toAdminSnapshot(admin) : null;
    }

    async findBreederById(breederId: string): Promise<BreederAdminBreederSnapshot | null> {
        const breeder = await this.breederAdminRepository.findBreederById(breederId);
        return breeder ? this.toBreederSnapshot(breeder) : null;
    }

    async updateBreeder(
        breederId: string,
        patch: BreederAdminBreederPatch,
    ): Promise<BreederAdminBreederSnapshot | null> {
        const breeder = await this.breederAdminRepository.updateBreeder(breederId, patch);
        return breeder ? this.toBreederSnapshot(breeder) : null;
    }

    async appendAdminActivityLog(adminId: string, logEntry: BreederAdminActivityLogEntry): Promise<void> {
        await this.breederAdminRepository.appendAdminActivityLog(adminId, logEntry);
    }

    private toAdminSnapshot(admin: BreederAdminAdminDocumentRecord): BreederAdminAdminSnapshot {
        return {
            id: admin._id.toString(),
            name: admin.name,
            permissions: admin.permissions,
            activityLogs: admin.activityLogs,
        };
    }

    private toBreederSnapshot(breeder: BreederAdminBreederDocumentRecord): BreederAdminBreederSnapshot {
        return {
            id: breeder._id.toString(),
            name: breeder.name || '',
            nickname: breeder.nickname,
            emailAddress: breeder.emailAddress,
            accountStatus: breeder.accountStatus || 'active',
            suspensionReason: breeder.suspensionReason,
            suspendedAt: breeder.suspendedAt,
            isTestAccount: breeder.isTestAccount || false,
            verification: breeder.verification
                ? {
                      status: breeder.verification.status,
                  }
                : undefined,
        };
    }
}
