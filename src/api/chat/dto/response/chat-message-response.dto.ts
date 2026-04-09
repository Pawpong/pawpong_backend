import { ApiProperty } from '@nestjs/swagger';
import { MessageType, SenderRole } from '../../../../schema/chat-message.schema';

export class ChatMessageResponseDto {
    @ApiProperty()
    messageId: string;

    @ApiProperty()
    roomId: string;

    @ApiProperty()
    senderId: string;

    @ApiProperty({ enum: SenderRole })
    senderRole: SenderRole;

    @ApiProperty()
    content: string;

    @ApiProperty({ enum: MessageType })
    messageType: MessageType;

    @ApiProperty()
    isRead: boolean;

    @ApiProperty()
    createdAt: Date;
}
