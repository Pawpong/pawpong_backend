import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { APP_SPLASH_PLATFORMS } from '../constants/app-splash.constants';
import type { AppSplashPlatform } from '../application/types/app-splash.type';

/** 공개 쿼리와 관리자 경로 모두 지원 플랫폼만 허용한다. */
export class AppSplashPlatformDto {
    @ApiProperty({ enum: APP_SPLASH_PLATFORMS })
    @IsIn(APP_SPLASH_PLATFORMS)
    platform: AppSplashPlatform;
}
