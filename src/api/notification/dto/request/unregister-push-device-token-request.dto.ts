import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 디바이스 푸시 토큰 해제 요청 DTO
 * 토큰을 URL path param이 아닌 body로 받아 HTTP 로그에 노출되지 않도록 한다.
 */
export class UnregisterPushDeviceTokenRequestDto {
    @ApiProperty({
        description: '해제할 FCM 디바이스 토큰',
        example: 'fcm-device-token-string',
    })
    @IsString()
    @IsNotEmpty()
    token: string;
}
