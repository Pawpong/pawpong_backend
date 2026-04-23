import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * 디바이스 푸시 토큰 등록 요청 DTO
 */
export class RegisterPushDeviceTokenRequestDto {
    @ApiProperty({
        description: 'FCM 발급 디바이스 토큰 (RN expo-notifications 에서 획득)',
        example: 'fcm-device-token-string',
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        description: '디바이스 플랫폼',
        enum: ['ios', 'android'],
        example: 'ios',
    })
    @IsString()
    @IsIn(['ios', 'android'])
    platform: 'ios' | 'android';

    @ApiProperty({
        description: '앱 버전 (디버깅용)',
        example: '1.0.0',
        required: false,
    })
    @IsOptional()
    @IsString()
    appVersion?: string;
}
