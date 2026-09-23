import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { GetAppSplashUseCase } from '../application/use-cases/get-app-splash.use-case';
import { AppSplashPlatformDto } from '../dto/app-splash-platform.dto';
import { APP_SPLASH_READ_MESSAGE } from '../constants/app-splash.constants';
import { ApiGetAppSplash } from '../swagger';

@ApiTags('앱 스플래시')
@Controller('v2/app-splash')
export class AppSplashController {
    constructor(private readonly read: GetAppSplashUseCase) {}
    /** 비활성화와 이미지 변경이 다음 앱 실행에 반영되도록 응답 캐시를 금지한다. */
    @Get()
    @Header('Cache-Control', 'no-store')
    @ApiGetAppSplash()
    async get(@Query() query: AppSplashPlatformDto) {
        return ApiResponseDto.success(await this.read.execute(query.platform), APP_SPLASH_READ_MESSAGE);
    }
}
