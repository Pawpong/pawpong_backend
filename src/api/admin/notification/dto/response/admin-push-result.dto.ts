import { ApiProperty } from '@nestjs/swagger';

export class AdminPushResultResponseDto {
    @ApiProperty({ description: '대상으로 식별된 사용자 수', example: 1024 })
    recipients: number;

    @ApiProperty({ description: 'in-app 알림 doc 으로 저장된 수', example: 1024 })
    notificationsCreated: number;

    @ApiProperty({ description: 'FCM 발송 시도된 푸시 토큰 수', example: 1320 })
    pushTokensTargeted: number;

    @ApiProperty({ description: 'FCM 성공 응답 수', example: 1290 })
    pushSuccess: number;

    @ApiProperty({ description: 'FCM 실패 응답 수', example: 30 })
    pushFailed: number;

    @ApiProperty({
        description: 'FCM 이 invalid 라고 응답한 토큰 수 (후속 cleanup 대상, 본 endpoint 는 정리 안 함)',
        example: 12,
    })
    invalidTokens: number;
}
