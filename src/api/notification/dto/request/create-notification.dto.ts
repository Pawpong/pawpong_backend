import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

import { NotificationType, RecipientType } from '../../../../common/enum/user.enum';

export class CreateNotificationDto {
    @ApiProperty({ description: '수신자 ID' })
    @IsString()
    @IsNotEmpty()
    recipientId: string;

    @ApiProperty({ description: '수신자 타입', enum: RecipientType })
    @IsEnum(RecipientType)
    recipientType: RecipientType;

    @ApiProperty({ description: '알림 제목' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: '알림 내용' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: '알림 타입', enum: NotificationType })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({ description: '관련 리소스 ID', required: false })
    @IsString()
    @IsOptional()
    relatedId?: string;

    @ApiProperty({ description: '관련 리소스 타입', required: false })
    @IsString()
    @IsOptional()
    relatedType?: string;
}
