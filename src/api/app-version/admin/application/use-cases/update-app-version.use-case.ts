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
        // 둘 다 같은 요청에 있으면 브릭 방지 체크. 단일 필드 업데이트의 cross-field 검증은
        // 어드민 UI 폼이 1차로 막고, 서버는 동일 페이로드 내 일관성만 책임진다.
        if (updateData.latestVersion !== undefined && updateData.minRequiredVersion !== undefined) {
            this.appVersionAdminCommandPolicyService.ensureMinRequiredNotAboveLatest(
                updateData.minRequiredVersion,
                updateData.latestVersion,
            );
        }

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
