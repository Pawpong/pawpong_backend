import { Injectable } from '@nestjs/common';

import { AppVersionAdminSnapshot } from '../application/ports/app-version-admin-reader.port';
import { AppVersionWriterPort } from '../application/ports/app-version-writer.port';
import { type AppVersionCreateCommand, type AppVersionUpdateCommand } from '../application/types/app-version-command.type';
import { AppVersionRepository } from '../../repository/app-version.repository';

@Injectable()
export class AppVersionMongooseWriterAdapter implements AppVersionWriterPort {
    constructor(private readonly appVersionRepository: AppVersionRepository) {}

    async create(createData: AppVersionCreateCommand): Promise<AppVersionAdminSnapshot> {
        const appVersion = await this.appVersionRepository.create(createData);
        return this.toSnapshot(appVersion);
    }

    async update(
        appVersionId: string,
        updateData: AppVersionUpdateCommand,
    ): Promise<AppVersionAdminSnapshot | null> {
        const appVersion = await this.appVersionRepository.update(appVersionId, updateData);
        if (!appVersion) {
            return null;
        }
        return this.toSnapshot(appVersion);
    }

    async delete(appVersionId: string): Promise<boolean> {
        return this.appVersionRepository.deleteById(appVersionId);
    }

    private toSnapshot(version: any): AppVersionAdminSnapshot {
        return {
            appVersionId: version._id.toString(),
            platform: version.platform,
            latestVersion: version.latestVersion,
            minRequiredVersion: version.minRequiredVersion,
            forceUpdateMessage: version.forceUpdateMessage,
            recommendUpdateMessage: version.recommendUpdateMessage,
            iosStoreUrl: version.iosStoreUrl,
            androidStoreUrl: version.androidStoreUrl,
            isActive: version.isActive,
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
        };
    }
}
