import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionAdminCommandPolicyService } from '../../domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminItemPresentationService } from '../../domain/services/app-version-admin-item-presentation.service';
import { APP_VERSION_WRITER, type AppVersionWriterPort } from '../ports/app-version-writer.port';
import { type AppVersionUpdateCommand } from '../types/app-version-command.type';
import { type AppVersionAdminItemResult } from '../types/app-version-query.type';

@Injectable()
export class UpdateAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_WRITER)
        private readonly appVersionWriter: AppVersionWriterPort,
        private readonly appVersionAdminItemPresentationService: AppVersionAdminItemPresentationService,
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
                throw new NotFoundException('앱 버전 정보를 찾을 수 없습니다.');
            }

            this.logger.logSuccess('updateAppVersion', '앱 버전 수정 완료', { appVersionId });
            return this.appVersionAdminItemPresentationService.toResponseDto(updated);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.logError('updateAppVersion', '앱 버전 수정', error);
            throw new BadRequestException('앱 버전 수정에 실패했습니다.');
        }
    }
}
