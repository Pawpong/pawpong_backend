import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

import { AppVersionService } from './app-version.service';

import { AppVersionCheckResponseDto } from './dto/response/app-version-check-response.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';

/**
 * 앱 버전 체크 컨트롤러 (공개 API)
 * RN 앱 시작 시 강제/권장 업데이트 여부 확인 API
 */
@ApiTags('앱 버전')
@Controller('app-version')
export class AppVersionController {
    constructor(private readonly appVersionService: AppVersionService) {}

    /**
     * 앱 버전 체크 (RN 앱 시작 시 호출)
     * 현재 버전을 기준으로 강제/권장 업데이트 여부를 반환
     */
    @Get('check')
    @ApiOperation({
        summary: '앱 버전 체크',
        description: 'RN 앱 시작 시 강제/권장 업데이트 여부를 확인합니다. needsForceUpdate가 true면 앱 사용 불가.',
    })
    @ApiQuery({
        name: 'platform',
        enum: ['ios', 'android'],
        required: true,
        description: '플랫폼 구분',
    })
    @ApiQuery({
        name: 'currentVersion',
        type: String,
        required: true,
        description: '현재 앱 버전',
        example: '1.0.0',
    })
    @ApiResponse({ status: 200, description: '버전 체크 성공', type: AppVersionCheckResponseDto })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async checkVersion(
        @Query('platform') platform: 'ios' | 'android',
        @Query('currentVersion') currentVersion: string,
    ): Promise<ApiResponseDto<AppVersionCheckResponseDto>> {
        const result = await this.appVersionService.checkVersion(platform, currentVersion);
        return {
            success: true,
            code: 200,
            data: result,
            message: '버전 체크 완료',
            timestamp: new Date().toISOString(),
        };
    }
}
