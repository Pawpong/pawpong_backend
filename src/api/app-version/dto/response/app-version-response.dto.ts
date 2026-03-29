import { ApiProperty } from '@nestjs/swagger';

/**
 * 앱 버전 응답 DTO (관리자용)
 */
export class AppVersionResponseDto {
    /**
     * 앱 버전 ID
     */
    @ApiProperty({
        description: '앱 버전 ID',
        example: '507f1f77bcf86cd799439011',
    })
    appVersionId: string;

    /**
     * 플랫폼
     */
    @ApiProperty({
        description: '플랫폼 구분',
        enum: ['ios', 'android'],
        example: 'ios',
    })
    platform: 'ios' | 'android';

    /**
     * 최신 버전
     */
    @ApiProperty({
        description: '최신 버전',
        example: '1.2.0',
    })
    latestVersion: string;

    /**
     * 최소 요구 버전
     */
    @ApiProperty({
        description: '최소 요구 버전 (이 미만 강제 업데이트)',
        example: '1.0.0',
    })
    minRequiredVersion: string;

    /**
     * 강제 업데이트 메시지
     */
    @ApiProperty({
        description: '강제 업데이트 메시지',
        example: '필수 보안 업데이트가 있습니다. 앱을 업데이트해주세요.',
    })
    forceUpdateMessage: string;

    /**
     * 권장 업데이트 메시지
     */
    @ApiProperty({
        description: '권장 업데이트 메시지',
        example: '새로운 기능이 추가되었습니다. 업데이트를 권장합니다.',
    })
    recommendUpdateMessage: string;

    /**
     * iOS App Store URL
     */
    @ApiProperty({
        description: 'iOS App Store URL',
        example: 'https://apps.apple.com/app/pawpong/id000000000',
    })
    iosStoreUrl: string;

    /**
     * Google Play Store URL
     */
    @ApiProperty({
        description: 'Google Play Store URL',
        example: 'https://play.google.com/store/apps/details?id=kr.pawpong.app',
    })
    androidStoreUrl: string;

    /**
     * 활성화 여부
     */
    @ApiProperty({
        description: '활성화 여부',
        example: true,
    })
    isActive: boolean;

    /**
     * 생성일
     */
    @ApiProperty({
        description: '생성일',
        example: '2025-01-14T10:30:00.000Z',
    })
    createdAt: string;

    /**
     * 수정일
     */
    @ApiProperty({
        description: '수정일',
        example: '2025-01-14T10:30:00.000Z',
    })
    updatedAt: string;
}
