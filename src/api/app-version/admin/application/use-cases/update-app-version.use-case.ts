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

        try {
            const updated = await this.appVersionWriter.update(appVersionId, updateData);

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
