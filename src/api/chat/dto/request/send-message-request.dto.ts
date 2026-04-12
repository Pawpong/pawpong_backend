import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../../../../schema/chat-message.schema';

export class SendMessageRequestDto {
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
