import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AppVersionCreateRequestDto } from '../../../dto/request/app-version-create-request.dto';
import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';
import { AppVersionAdminCommandPolicyService } from '../../domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminPresentationService } from '../../domain/services/app-version-admin-presentation.service';
import { APP_VERSION_WRITER, type AppVersionWriterPort } from '../ports/app-version-writer.port';

@Injectable()
export class CreateAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_WRITER)
        private readonly appVersionWriter: AppVersionWriterPort,
        private readonly appVersionAdminPresentationService: AppVersionAdminPresentationService,
        private readonly appVersionAdminCommandPolicyService: AppVersionAdminCommandPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(adminId: string, createData: AppVersionCreateRequestDto): Promise<AppVersionResponseDto> {
        this.logger.logStart('createAppVersion', '앱 버전 생성 시작', { adminId, platform: createData.platform });
        this.appVersionAdminCommandPolicyService.ensureAdminId(adminId);

        try {
            const appVersion = await this.appVersionWriter.create(createData);

            this.logger.logSuccess('createAppVersion', '앱 버전 생성 완료', {
                appVersionId: appVersion.appVersionId,
                platform: createData.platform,
                latestVersion: createData.latestVersion,
            });

            return this.appVersionAdminPresentationService.toResponseDto(appVersion);
        } catch (error) {
            this.logger.logError('createAppVersion', '앱 버전 생성', error);
            throw new BadRequestException('앱 버전 생성에 실패했습니다.');
        }
    }
}
