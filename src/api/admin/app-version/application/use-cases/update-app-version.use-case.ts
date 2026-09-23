import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionAdminCommandPolicyService } from '../../domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminItemMapperService } from '../../domain/services/app-version-admin-item-mapper.service';
import { APP_VERSION_WRITER_PORT, type AppVersionWriterPort } from '../ports/app-version-writer.port';
import { type AppVersionUpdateCommand } from '../types/app-version-command.type';
import { type AppVersionAdminItemResult } from '../types/app-version-query.type';

@Injectable()
export class UpdateAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_WRITER_PORT)
        private readonly appVersionWriter: AppVersionWriterPort,
        private readonly appVersionAdminItemMapperService: AppVersionAdminItemMapperService,
        private readonly appVersionAdminCommandPolicyService: AppVersionAdminCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        appVersionId: string,
        adminId: string,
        updateData: AppVersionUpdateCommand,
    ): Promise<AppVersionAdminItemResult> {
        this.logger.logStart('updateAppVersion', '앱 버전 수정 시작', { appVersionId, adminId });

        this.appVersionAdminCommandPolicyService.ensureAppVersionId(appVersionId);
        this.appVersionAdminCommandPolicyService.ensureAdminId(adminId);

        // 부분 업데이트라도 들어온 필드는 형식 검증.
        if (updateData.latestVersion !== undefined) {
            this.appVersionAdminCommandPolicyService.ensureSemverFormat(updateData.latestVersion, '최신 버전');
        }
        if (updateData.minRequiredVersion !== undefined) {
            this.appVersionAdminCommandPolicyService.ensureSemverFormat(
                updateData.minRequiredVersion,
                '최소 요구 버전',
            );
        }
        try {
            const current = await this.appVersionWriter.findById(appVersionId);
            if (!current) throw new DomainNotFoundError('앱 버전 정보를 찾을 수 없습니다.');
            // 한 필드만 PATCH하더라도 저장된 값과 합친 정책을 검증한다.
            this.appVersionAdminCommandPolicyService.ensureMinRequiredNotAboveLatest(
                updateData.minRequiredVersion ?? current.minRequiredVersion,
                updateData.latestVersion ?? current.latestVersion,
            );
            this.appVersionAdminCommandPolicyService.ensureStoreUrls(
                updateData.iosStoreUrl ?? current.iosStoreUrl,
                updateData.androidStoreUrl ?? current.androidStoreUrl,
            );
            // 검증한 두 버전은 함께 원자적으로 저장해 동시 PATCH에서도 역전되지 않게 한다.
            const updated = await this.appVersionWriter.update(appVersionId, {
                ...updateData,
                latestVersion: updateData.latestVersion ?? current.latestVersion,
                minRequiredVersion: updateData.minRequiredVersion ?? current.minRequiredVersion,
            });

            if (!updated) {
                throw new DomainNotFoundError('앱 버전 정보를 찾을 수 없습니다.');
            }

            this.logger.logSuccess('updateAppVersion', '앱 버전 수정 완료', { appVersionId });
            return this.appVersionAdminItemMapperService.toResult(updated);
        } catch (error) {
            this.logger.logError('updateAppVersion', '앱 버전 수정', error);
            throw error;
        }
    }
}
