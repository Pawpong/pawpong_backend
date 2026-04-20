import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionAdminCommandPolicyService } from '../../domain/services/app-version-admin-command-policy.service';
import { APP_VERSION_WRITER_PORT, type AppVersionWriterPort } from '../ports/app-version-writer.port';

@Injectable()
export class DeleteAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_WRITER_PORT)
        private readonly appVersionWriter: AppVersionWriterPort,
        private readonly appVersionAdminCommandPolicyService: AppVersionAdminCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(appVersionId: string, adminId: string): Promise<void> {
        this.logger.logStart('deleteAppVersion', '앱 버전 삭제 시작', { appVersionId, adminId });

        this.appVersionAdminCommandPolicyService.ensureAppVersionId(appVersionId);
        this.appVersionAdminCommandPolicyService.ensureAdminId(adminId);

        try {
            const deleted = await this.appVersionWriter.delete(appVersionId);

            if (!deleted) {
                throw new DomainNotFoundError('앱 버전 정보를 찾을 수 없습니다.');
            }

            this.logger.logSuccess('deleteAppVersion', '앱 버전 삭제 완료', { appVersionId });
        } catch (error) {
            this.logger.logError('deleteAppVersion', '앱 버전 삭제', error);
            throw error;
        }
    }
}
