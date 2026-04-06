import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionUpdateRequestDto } from '../../../dto/request/app-version-update-request.dto';
import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';
import { AppVersionAdminCommandPolicyService } from '../../domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminPresentationService } from '../../domain/services/app-version-admin-presentation.service';
import { APP_VERSION_WRITER, type AppVersionWriterPort } from '../ports/app-version-writer.port';

@Injectable()
export class UpdateAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_WRITER)
        private readonly appVersionWriter: AppVersionWriterPort,
        private readonly appVersionAdminPresentationService: AppVersionAdminPresentationService,
        private readonly appVersionAdminCommandPolicyService: AppVersionAdminCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        appVersionId: string,
        adminId: string,
        updateData: AppVersionUpdateRequestDto,
    ): Promise<AppVersionResponseDto> {
        this.logger.logStart('updateAppVersion', '앱 버전 수정 시작', { appVersionId, adminId });

        this.appVersionAdminCommandPolicyService.ensureAppVersionId(appVersionId);
        this.appVersionAdminCommandPolicyService.ensureAdminId(adminId);

        try {
            const updated = await this.appVersionWriter.update(appVersionId, updateData);

            if (!updated) {
                throw new NotFoundException('앱 버전 정보를 찾을 수 없습니다.');
            }

            this.logger.logSuccess('updateAppVersion', '앱 버전 수정 완료', { appVersionId });
            return this.appVersionAdminPresentationService.toResponseDto(updated);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.logError('updateAppVersion', '앱 버전 수정', error);
            throw new BadRequestException('앱 버전 수정에 실패했습니다.');
        }
    }
}
