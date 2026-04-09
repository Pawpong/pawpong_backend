import { Controller, Get, Query } from '@nestjs/common';

import { CheckAppVersionUseCase } from './application/use-cases/check-app-version.use-case';
import { ApiAppVersionController, ApiCheckAppVersionEndpoint } from './swagger';

import { AppVersionCheckResponseDto } from './dto/response/app-version-check-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { AppVersionResponseMessageService } from './domain/services/app-version-response-message.service';

/**
 * 앱 버전 체크 컨트롤러 (공개 API)
 * RN 앱 시작 시 강제/권장 업데이트 여부 확인 API
 */
@ApiAppVersionController()
@Controller('app-version')
export class AppVersionController {
    constructor(
        private readonly checkAppVersionUseCase: CheckAppVersionUseCase,
        private readonly appVersionResponseMessageService: AppVersionResponseMessageService,
    ) {}

    /**
     * 앱 버전 체크 (RN 앱 시작 시 호출)
     * 현재 버전을 기준으로 강제/권장 업데이트 여부를 반환
     */
    @Get('check')
    @ApiCheckAppVersionEndpoint()
    async checkVersion(
        @Query('platform') platform: 'ios' | 'android',
        @Query('currentVersion') currentVersion: string,
    ): Promise<ApiResponseDto<AppVersionCheckResponseDto>> {
        const result = await this.checkAppVersionUseCase.execute(platform, currentVersion);
        return ApiResponseDto.success(result, this.appVersionResponseMessageService.versionChecked());
    }
}
