import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * 디바이스 푸시 토큰 등록 요청 DTO
 */
export class RegisterPushDeviceTokenRequestDto {
    @ApiProperty({
        description: 'Firebase Messaging에서 발급한 FCM 토큰 (Expo/APNs 토큰 아님)',
        example: 'fcm-device-token-string',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(4096)
    @Matches(/^\S+$/)
    token: string;

    @ApiProperty({
        description: '디바이스 플랫폼 (웹 브릿지 경유 시 생략 가능)',
        enum: ['ios', 'android'],
        example: 'ios',
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsIn(['ios', 'android'])
    platform?: 'ios' | 'android';

    @ApiProperty({
        description: '앱 버전 (디버깅용)',
        example: '1.0.0',
        required: false,
    })
    @IsOptional()
    @IsString()
    appVersion?: string;
}
