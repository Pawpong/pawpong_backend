import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

/**
 * 앱 버전 수정 요청 DTO
 * 모든 필드는 선택사항 (수정할 필드만 전달)
 */
export class AppVersionUpdateRequestDto {
    /**
     * 최신 버전
     */
    @ApiProperty({ description: '최신 버전 (예: "1.3.0")', example: '1.3.0', required: false })
    @IsString()
    @IsOptional()
    latestVersion?: string;

    /**
     * 최소 요구 버전
     */
    @ApiProperty({ description: '최소 요구 버전 (예: "1.1.0")', example: '1.1.0', required: false })
    @IsString()
    @IsOptional()
    minRequiredVersion?: string;

    /**
     * 강제 업데이트 메시지
     */
    @ApiProperty({ description: '강제 업데이트 메시지', required: false })
    @IsString()
    @IsOptional()
    forceUpdateMessage?: string;

    /**
     * 권장 업데이트 메시지
     */
    @ApiProperty({ description: '권장 업데이트 메시지', required: false })
    @IsString()
    @IsOptional()
    recommendUpdateMessage?: string;

    /**
     * iOS App Store URL
     */
    @ApiProperty({ description: 'iOS App Store URL', required: false })
    @IsString()
    @IsOptional()
    iosStoreUrl?: string;

    /**
     * Google Play Store URL
     */
    @ApiProperty({ description: 'Google Play Store URL', required: false })
    @IsString()
    @IsOptional()
    androidStoreUrl?: string;

    /**
     * 활성화 여부
     */
    @ApiProperty({ description: '활성화 여부', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
