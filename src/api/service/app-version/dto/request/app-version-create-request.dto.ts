import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsIn } from 'class-validator';

/**
 * 앱 버전 생성 요청 DTO
 */
export class AppVersionCreateRequestDto {
    /**
     * 플랫폼 구분
     */
    @ApiProperty({
        description: '플랫폼 구분',
        enum: ['ios', 'android'],
        example: 'ios',
    })
    @IsString()
    @IsIn(['ios', 'android'])
    platform: 'ios' | 'android';

    /**
     * 최신 버전
     */
    @ApiProperty({
        description: '최신 버전 (예: "1.2.0")',
        example: '1.2.0',
    })
    @IsString()
    @IsNotEmpty()
    latestVersion: string;

    /**
     * 최소 요구 버전 (이 미만은 강제 업데이트)
     */
    @ApiProperty({
        description: '최소 요구 버전 - 이 버전 미만이면 강제 업데이트 (예: "1.0.0")',
        example: '1.0.0',
    })
    @IsString()
    @IsNotEmpty()
    minRequiredVersion: string;

    /**
     * 강제 업데이트 메시지
     */
    @ApiProperty({
        description: '강제 업데이트 메시지 (앱 사용 불가, 반드시 업데이트 필요)',
        example: '필수 보안 업데이트가 있습니다. 앱을 업데이트해주세요.',
    })
    @IsString()
    @IsNotEmpty()
    forceUpdateMessage: string;

    /**
     * 권장 업데이트 메시지
     */
    @ApiProperty({
        description: '권장 업데이트 메시지 (닫기 가능)',
        example: '새로운 기능이 추가되었습니다. 업데이트를 권장합니다.',
    })
    @IsString()
    @IsNotEmpty()
    recommendUpdateMessage: string;

    /**
     * iOS App Store URL
     */
    @ApiProperty({
        description: 'iOS App Store URL',
        example: 'https://apps.apple.com/app/pawpong/id000000000',
    })
    @IsString()
    @IsNotEmpty()
    iosStoreUrl: string;

    /**
     * Google Play Store URL
     */
    @ApiProperty({
        description: 'Google Play Store URL',
        example: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
    })
    @IsString()
    @IsNotEmpty()
    androidStoreUrl: string;

    /**
     * 활성화 여부
     */
    @ApiProperty({
        description: '활성화 여부',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
