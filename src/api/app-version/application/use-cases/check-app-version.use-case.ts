import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../common/utils/http-exception.util';
import { APP_VERSION_READER_PORT, type AppVersionReaderPort } from '../ports/app-version-reader.port';
import { type AppVersionCheckResult } from '../types/app-version-result.type';
import { AppVersionPolicyService } from '../../domain/services/app-version-policy.service';

@Injectable()
export class CheckAppVersionUseCase {
    constructor(
        @Inject(APP_VERSION_READER_PORT)
        private readonly appVersionReader: AppVersionReaderPort,
        private readonly appVersionPolicyService: AppVersionPolicyService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(platform: 'ios' | 'android', currentVersion: string): Promise<AppVersionCheckResult> {
        this.logger.logStart('checkVersion', '앱 버전 체크', { platform, currentVersion });

        if (!platform || !currentVersion) {
            throw new BadRequestException('플랫폼과 현재 버전 정보가 필요합니다.');
        }

        try {
            const versionInfo = await this.appVersionReader.findLatestActiveByPlatform(platform);
            const result = this.appVersionPolicyService.buildCheckResponse(platform, currentVersion, versionInfo);

            this.logger.logSuccess('checkVersion', '앱 버전 체크 완료', {
                needsForceUpdate: result.needsForceUpdate,
                needsRecommendUpdate: result.needsRecommendUpdate,
                latestVersion: result.latestVersion,
            });

            return result;
        } catch (error) {
            rethrowIfHttpException(error);
            this.logger.logError('checkVersion', '앱 버전 체크', error);
            throw new BadRequestException('버전 체크에 실패했습니다.');
        }
    }
}
