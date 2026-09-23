import { ApiProperty } from '@nestjs/swagger';
import type { AppSplashPlatform } from '../application/types/app-splash.type';

/** 앱과 어드민이 함께 사용하는 응답 계약. */
export class AppSplashResponseDto {
    @ApiProperty({ enum: ['ios', 'android'] }) platform: AppSplashPlatform;
    @ApiProperty() isEnabled: boolean;
    @ApiProperty() imageFileName: string;
    @ApiProperty() imageUrl: string;
    @ApiProperty() backgroundColor: string;
    @ApiProperty() imageWidth: number;
    @ApiProperty() durationMs: number;
    @ApiProperty({ type: String, nullable: true }) updatedAt: string | null;
}
