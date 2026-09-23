import { IsString, IsEnum, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../../../../../schema/chat-message.schema';

export class SendMessageRequestDto {
    @ApiProperty({ description: '재시도에도 유지하는 발신 식별자', required: false, maxLength: 128 })
    @ValidateIf((_object, value) => value !== undefined)
    @Matches(/^[A-Za-z0-9_-]{1,128}$/)
    clientMessageId?: string;

    @ApiProperty({ description: '채팅방 ID' })
    @IsString()
    roomId: string;

    @ApiProperty({ description: '메시지 내용' })
    @IsString()
    content: string;

    @ApiProperty({ description: '메시지 타입', enum: MessageType, default: MessageType.TEXT })
    @IsOptional()
    @IsEnum(MessageType)
    messageType?: MessageType;
}
