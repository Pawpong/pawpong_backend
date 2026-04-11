import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { AppVersionAdminCommandPolicyService } from '../../domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminItemPresentationService } from '../../domain/services/app-version-admin-item-presentation.service';
import { APP_VERSION_WRITER, type AppVersionWriterPort } from '../ports/app-version-writer.port';
import { type AppVersionCreateCommand } from '../types/app-version-command.type';
import { type AppVersionAdminItemResult } from '../types/app-version-query.type';

@Injectable()
export class CreateAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_WRITER)
        private readonly appVersionWriter: AppVersionWriterPort,
        private readonly appVersionAdminItemPresentationService: AppVersionAdminItemPresentationService,
        private readonly appVersionAdminCommandPolicyService: AppVersionAdminCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminId: string, createData: AppVersionCreateCommand): Promise<AppVersionAdminItemResult> {
        this.logger.logStart('createAppVersion', '앱 버전 생성 시작', { adminId, platform: createData.platform });
        this.appVersionAdminCommandPolicyService.ensureAdminId(adminId);

        try {
            const appVersion = await this.appVersionWriter.create(createData);

            this.logger.logSuccess('createAppVersion', '앱 버전 생성 완료', {
                appVersionId: appVersion.appVersionId,
                platform: createData.platform,
                latestVersion: createData.latestVersion,
            });

            return this.appVersionAdminItemPresentationService.toResponseDto(appVersion);
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('createAppVersion', '앱 버전 생성', error);
            throw new BadRequestException('앱 버전 생성에 실패했습니다.');
        }
    }
}
