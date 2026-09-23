import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../../common/decorator/roles.decorator';
import { JwtAuthGuard } from '../../../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guard/roles.guard';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { AppSplashPlatformDto } from '../../../service/app-splash/dto/app-splash-platform.dto';
import {
    APP_SPLASH_READ_MESSAGE,
    APP_SPLASH_SAVE_MESSAGE,
} from '../../../service/app-splash/constants/app-splash.constants';
import { ManageAppSplashUseCase } from '../application/use-cases/manage-app-splash.use-case';
import { SaveAppSplashDto } from '../dto/save-app-splash.dto';
import { ApiListAppSplashes, ApiSaveAppSplash } from '../swagger';

@ApiTags('앱 스플래시 관리')
@ApiBearerAuth('JWT-Auth')
@Controller('app-splash-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AppSplashAdminController {
    constructor(private readonly manage: ManageAppSplashUseCase) {}
    /** 두 플랫폼의 현재 설정을 조회한다. */
    @Get()
    @ApiListAppSplashes()
    async list() {
        return ApiResponseDto.success(await this.manage.list(), APP_SPLASH_READ_MESSAGE);
    }
    /** 경로와 본문 검증 후 해당 플랫폼만 변경한다. */
    @Put(':platform')
    @ApiSaveAppSplash()
    async save(@Param() params: AppSplashPlatformDto, @Body() dto: SaveAppSplashDto) {
        return ApiResponseDto.success(
            await this.manage.save(params.platform, {
                isEnabled: dto.isEnabled,
                imageFileName: dto.imageFileName,
                backgroundColor: dto.backgroundColor,
                imageWidth: dto.imageWidth,
                durationMs: dto.durationMs,
            }),
            APP_SPLASH_SAVE_MESSAGE,
        );
    }
}
